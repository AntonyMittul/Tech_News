export function isCompleteSummary(value?: string | null) {
  const text = value?.trim() ?? "";
  if (text.length < 100) return false;
  if (text.includes("...") || text.includes("…")) return false;
  return /[A-Za-z0-9\])"'.!?]$/.test(text);
}

export function pickCompleteSummary(...values: Array<string | null | undefined>) {
  return values.find((value) => isCompleteSummary(value));
}
