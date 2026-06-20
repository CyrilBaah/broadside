import { describe, expect, it } from "vitest";
import { LANGUAGE_ICONS_BY_SLUG, languageIconFor } from "@/lib/icons/language-icons";

describe("languageIconFor (FR-016)", () => {
  it("matches a language name exactly", () => {
    const icon = languageIconFor("JavaScript");
    expect(icon?.slug).toBe("javascript");
  });

  it("matches case-insensitively", () => {
    const icon = languageIconFor("python");
    expect(icon?.slug).toBe("python");
    expect(languageIconFor("RUST")?.slug).toBe("rust");
  });

  it("returns undefined for an unrecognized language", () => {
    expect(languageIconFor("COBOL")).toBeUndefined();
  });

  it("returns undefined for null/undefined input", () => {
    expect(languageIconFor(null)).toBeUndefined();
    expect(languageIconFor(undefined)).toBeUndefined();
  });
});

describe("LANGUAGE_ICONS_BY_SLUG (FR-016)", () => {
  it("looks up icons by their simple-icons slug", () => {
    expect(LANGUAGE_ICONS_BY_SLUG.get("typescript")?.title).toBe("TypeScript");
  });

  it("returns undefined for an unknown slug", () => {
    expect(LANGUAGE_ICONS_BY_SLUG.get("not-a-real-slug")).toBeUndefined();
  });
});
