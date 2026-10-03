import { describe, expect, it } from "vitest";

import { isCompleteSummary, isUsefulHeadline, pickCompleteSummary } from "@/lib/content-quality";

describe("content quality", () => {
  it("accepts complete summaries and rejects truncated summaries", () => {
    const complete = "A complete technology summary has enough factual context for a reader to understand the event and its impact today.";
    expect(isCompleteSummary(complete)).toBe(true);
    expect(isCompleteSummary(`${complete}...`)).toBe(false);
    expect(isCompleteSummary("Too short.")).toBe(false);
  });

  it("selects the first complete summary fallback", () => {
    expect(pickCompleteSummary("short", "This description is long enough to explain the technology announcement and its likely impact on developers.")).toContain("technology announcement");
  });

  it("keeps technical workforce news and rejects unrelated jobs", () => {
    expect(isUsefulHeadline("Google announces software engineering hiring plans")).toBe(true);
    expect(isUsefulHeadline("Pakistan Railways is hiring retired employees")).toBe(false);
  });
});
