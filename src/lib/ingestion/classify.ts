const categoryRules = [
  { slug: "artificial-intelligence", terms: ["artificial intelligence", "generative ai", " ai ", "llm", "large language", "chatbot", "ai agent"] },
  { slug: "software-engineering", terms: ["software", "developer", "programming", "open source", "github", "database", "compiler", "engineering"] },
  { slug: "data-science", terms: ["data science", "data scientist", "analytics", "data platform", "big data", "data pipeline", "visualization", "statistics"] },
  { slug: "machine-learning", terms: ["machine learning", "deep learning", "neural network", "model training", "inference", "pytorch", "tensorflow"] },
  { slug: "corporate-technology", terms: ["acquisition", "merger", "earnings", "revenue", "ipo", "funding", "valuation", "ceo", "corporate"] },
  { slug: "hiring-layoffs", terms: ["hiring", "job", "jobs", "layoff", "workforce", "workforce reduction", "headcount", "recruiting", "recruitment", "career", "employment", "open roles"] },
  { slug: "cybersecurity", terms: ["cybersecurity", "cyber attack", "ransomware", "vulnerability", "breach", "security", "malware"] },
] as const;

const knownTags = [
  "ai", "llm", "generative-ai", "machine-learning", "data-science", "software-engineering",
  "open-source", "cloud", "cybersecurity", "startups", "funding", "hiring", "layoffs",
  "developer-tools", "databases", "robotics", "semiconductors",
];

export type Classification = {
  categorySlugs: string[];
  tags: string[];
};

export function classifyArticle(title: string, description?: string, contentExcerpt?: string): Classification {
  const text = ` ${[title, description, contentExcerpt].filter(Boolean).join(" ").toLowerCase()} `;
  const categorySlugs = categoryRules
    .filter((rule) => rule.terms.some((term) => text.includes(term)))
    .map((rule) => rule.slug);

  if (categorySlugs.length === 0) categorySlugs.push("software-engineering");

  const tags = knownTags.filter((tag) => {
    const terms = tag.replaceAll("-", " ");
    return text.includes(` ${terms} `) || text.includes(tag.replaceAll("-", " "));
  });

  return { categorySlugs, tags };
}

export function normalizedTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

export function titleSimilarity(left: string, right: string) {
  const leftTokens = new Set(normalizedTitle(left));
  const rightTokens = new Set(normalizedTitle(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / union;
}

const stopWords = new Set(["the", "and", "for", "with", "from", "that", "this", "are", "has", "new", "how", "why", "what", "its"]);
