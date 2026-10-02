export function isCompleteSummary(value?: string | null) {
  const text = value?.trim() ?? "";
  if (text.length < 100) return false;
  if (text.includes("...") || text.includes("…")) return false;
  return /[A-Za-z0-9\])"'.!?]$/.test(text);
}

export function pickCompleteSummary(...values: Array<string | null | undefined>) {
  return values.find((value) => isCompleteSummary(value));
}

export function isUsefulHeadline(title: string) {
  const text = title.toLowerCase();
  const lowSignal = ["best ", "top ", "deals", "sale", "buying guide", "gift guide", "podcast", "review", "sponsored", "discount"];
  if (lowSignal.some((term) => text.includes(term))) return false;

  const highSignal = [
    "openai", "anthropic", "deepmind", "google", "microsoft", "amazon", "meta", "apple", "nvidia", "intel", "github", "linux", "gpt", "gemini", "claude", "llm",
    "artificial intelligence", " ai ", "model", "research", "benchmark", "open source", "programming", "database", "cloud",
    "semiconductor", "cve", "vulnerability", "cybersecurity", "hiring", "layoff", "recruit", "workforce", "data scientist",
    "analytics", "funding", "acquisition", "earnings", "regulation", "robotics", "startup",
  ];
  if (!highSignal.some((term) => text.includes(term))) return false;

  if (/(hiring|layoff|recruit|workforce|headcount|jobs?)/.test(text)) {
    const technicalContext = ["technology", "tech", "software", "developer", "engineer", "data", "cloud", "cyber", "computer", "robotics", "startup", "ai", "openai", "anthropic", "google", "microsoft", "amazon", "meta", "apple", "nvidia", "intel", "github"];
    if (!technicalContext.some((term) => term === "ai" ? /\bai\b/.test(text) : text.includes(term))) return false;
  }
  return true;
}
