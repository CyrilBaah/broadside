import { describe, expect, it } from "vitest";
import { buildCardPath, decodeConfig, encodeConfig } from "@/lib/config/url-codec";
import { defaultConfigFor } from "@/lib/config/schema";

describe("config URL encode/decode round-trip (FR-008, SC-005)", () => {
  it("round-trips the default config to an empty query string", () => {
    const config = defaultConfigFor("vercel", "next.js");
    const params = encodeConfig(config);

    expect(params.toString()).toBe("");

    const decoded = decodeConfig(config.owner, config.repo, params);
    expect(decoded).toEqual(config);
  });

  it("round-trips a fully customized config", () => {
    const original = {
      owner: "vercel",
      repo: "next.js",
      theme: "dark" as const,
      font: "mono",
      pattern: "circuit" as const,
      template: "stats-forward" as const,
      format: "webp" as const,
      logo: "https://example.com/logo.png",
      descriptionOverride: "Custom description!",
    };

    const params = encodeConfig(original);
    const decoded = decodeConfig(original.owner, original.repo, params);

    expect(decoded).toEqual(original);
  });

  it("ignores unrecognized enum values and falls back to defaults", () => {
    const params = new URLSearchParams({ theme: "rainbow", template: "fancy" });
    const decoded = decodeConfig("vercel", "next.js", params);

    expect(decoded.theme).toBe("light");
    expect(decoded.template).toBe("default");
  });

  it("produces an identical decoded config for equivalent encoded URLs (SC-005)", () => {
    const configA = { ...defaultConfigFor("vercel", "next.js"), theme: "dark" as const };
    const pathA = buildCardPath(configA);

    const url = new URL(`https://broadside.dev${pathA}`);
    const [owner, repoWithExt] = url.pathname.slice(1).split("/");
    const repo = repoWithExt!.replace(/\.\w+$/, "");
    const decoded = decodeConfig(owner!, repo, url.searchParams);

    expect(decoded).toEqual(configA);
  });

  it("builds a path with the repo's extension and only non-default params", () => {
    const config = { ...defaultConfigFor("vercel", "next.js"), theme: "dark" as const };
    const path = buildCardPath(config, "webp");

    expect(path).toBe("/vercel/next.js.webp?theme=dark");
  });
});
