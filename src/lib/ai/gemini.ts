import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import { isCompleteSummary } from "@/lib/content-quality";

const enrichmentSchema = z.object({
  summary: z.string().min(100),
  keyPoints: z.array(z.string().min(1)).min(2).max(5),
  whyItMatters: z.string().min(1),
});

export type ArticleEnrichment = z.infer<typeof enrichmentSchema>;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A complete, factual summary in two or three sentences. Never use ellipses or truncation markers." },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Two to five factual bullet points." },
    whyItMatters: { type: Type.STRING, description: "A concise explanation of why this matters to technology readers." },
  },
  required: ["summary", "keyPoints", "whyItMatters"],
} as const;

const systemInstruction = [
  "You summarize technology news for computer science students and technology professionals.",
  "Use only the source material provided in the user prompt.",
  "Do not invent facts, dates, quotes, causes, outcomes, or details that are not present.",
  "If the source material is too limited to support a complete summary, reject the article rather than guessing.",
  "Never copy a trailing ellipsis, truncation marker, or unfinished sentence into the summary.",
  "Return only JSON matching the requested schema.",
].join(" ");

export async function enrichArticle(input: {
  title: string;
  sourceName: string;
  publishedAt: Date;
  description?: string | null;
  contentExcerpt?: string | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const sourceText = [input.description, input.contentExcerpt].filter(Boolean).join("\n\n");
  const prompt = [
    `Title: ${input.title}`,
    `Source: ${input.sourceName}`,
    `Published: ${input.publishedAt.toISOString()}`,
    `Source text: ${sourceText || "No source excerpt was provided."}`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");
  const enrichment = enrichmentSchema.parse(JSON.parse(text));
  if (!isCompleteSummary(enrichment.summary)) throw new Error("Gemini returned an incomplete summary");
  return enrichment;
}
