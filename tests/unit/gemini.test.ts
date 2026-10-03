import { describe, expect, it } from "vitest";

import { validateEnrichment } from "@/lib/ai/gemini";

const summary = "This complete summary gives technology readers enough factual context to understand the announcement, what changed, and why the development matters for engineers today.";

describe("Gemini response validation", () => {
  it("accepts a complete structured response", () => {
    expect(validateEnrichment({ summary, keyPoints: ["Point one", "Point two"], whyItMatters: "It affects engineers." })).toEqual({ summary, keyPoints: ["Point one", "Point two"], whyItMatters: "It affects engineers." });
  });

  it("rejects incomplete or truncated summaries", () => {
    expect(() => validateEnrichment({ summary: `${summary}…`, keyPoints: ["One", "Two"], whyItMatters: "It matters." })).toThrow();
    expect(() => validateEnrichment({ summary, keyPoints: ["Only one"], whyItMatters: "It matters." })).toThrow();
  });
});
