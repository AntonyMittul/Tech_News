import { describe, expect, it } from "vitest";

import { canonicalizeUrl, clampLimit, decodeHtmlEntities, fingerprintArticle, stripHtml } from "@/lib/ingestion/utils";

describe("ingestion utilities", () => {
  it("canonicalizes tracking parameters and fragments", () => {
    expect(canonicalizeUrl("https://example.com/story?utm_source=rss&id=7#comments")).toBe("https://example.com/story?id=7");
  });

  it("creates the same fingerprint for equivalent URLs", () => {
    expect(fingerprintArticle("A headline", "https://example.com/a?utm_medium=email")).toBe(
      fingerprintArticle(" a headline ", "https://example.com/a"),
    );
  });

  it("strips markup and decodes entities", () => {
    expect(stripHtml("<p>AI &amp; data</p>")).toBe("AI & data");
    expect(decodeHtmlEntities("&#x41;&#65; &quot;ok&quot;")).toBe('AA "ok"');
  });

  it("clamps provider limits", () => {
    expect(clampLimit(-3)).toBe(1);
    expect(clampLimit(999, 10)).toBe(10);
    expect(clampLimit(4.9)).toBe(4);
  });
});
