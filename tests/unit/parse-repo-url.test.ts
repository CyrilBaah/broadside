import { describe, expect, it } from "vitest";
import { InvalidRepoUrlError, parseRepoUrl } from "@/lib/config/parse-repo-url";

describe("parseRepoUrl (FR-001)", () => {
  it("parses a full https URL", () => {
    expect(parseRepoUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("normalizes mixed case to lowercase", () => {
    expect(parseRepoUrl("https://github.com/Vercel/Next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips a trailing slash", () => {
    expect(parseRepoUrl("https://github.com/vercel/next.js/")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips a trailing .git suffix", () => {
    expect(parseRepoUrl("https://github.com/vercel/next.js.git")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("accepts a bare owner/repo form without protocol or host", () => {
    expect(parseRepoUrl("vercel/next.js")).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("accepts a host-only form without protocol", () => {
    expect(parseRepoUrl("github.com/vercel/next.js")).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("treats all equivalent forms as identical (SC-005 reproducibility)", () => {
    const forms = [
      "https://github.com/Vercel/Next.js/",
      "github.com/vercel/next.js.git",
      "Vercel/Next.js",
    ];
    const results = forms.map(parseRepoUrl);
    expect(new Set(results.map((r) => `${r.owner}/${r.repo}`)).size).toBe(1);
  });

  it("throws InvalidRepoUrlError for an empty string", () => {
    expect(() => parseRepoUrl("")).toThrow(InvalidRepoUrlError);
  });

  it("throws InvalidRepoUrlError when no repo segment is present", () => {
    expect(() => parseRepoUrl("https://github.com/vercel")).toThrow(InvalidRepoUrlError);
  });

  it("throws InvalidRepoUrlError when the first segment isn't a valid GitHub owner name", () => {
    // Non-GitHub hosts with a dotted segment (e.g. a TLD) fail the owner
    // character check here; a non-existent owner/repo combination without a
    // dot still parses successfully but correctly 404s at the GitHub fetch
    // step (FR-014), since this parser can't distinguish hosts on syntax alone.
    expect(() => parseRepoUrl("https://example.com/a/b")).toThrow(InvalidRepoUrlError);
  });
});
