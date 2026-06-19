import { describe, expect, it } from "vitest";
import { defaultConfigFor } from "@/lib/config/schema";
import { buildCardPath, decodeConfig } from "@/lib/config/url-codec";

/**
 * SC-005: a shared card configuration URL reproduces an identical card for any
 * visitor who opens it, with no loss of customization detail.
 */
describe("customization round-trip (SC-005)", () => {
  it("reproduces an identical config after a full customization pass through a URL", () => {
    const customized = {
      ...defaultConfigFor("vercel", "next.js"),
      theme: "dark" as const,
      font: "mono",
      pattern: "grid" as const,
      template: "minimal" as const,
      descriptionOverride: "Pin up your repo.",
      logo: "data:image/png;base64,aGVsbG8=",
    };

    const path = buildCardPath(customized);
    const url = new URL(`https://broadside.dev${path}`);
    const repo = url.pathname.split("/")[2]!.replace(/\.\w+$/, "");

    const reproduced = decodeConfig(customized.owner, repo, url.searchParams);

    expect(reproduced).toEqual(customized);
  });

  it("changing one knob doesn't disturb the others across the URL round-trip", () => {
    const base = { ...defaultConfigFor("vercel", "next.js"), theme: "dark" as const, font: "mono" };
    const changed = { ...base, pattern: "dots" as const };

    const path = buildCardPath(changed);
    const url = new URL(`https://broadside.dev${path}`);
    const repo = url.pathname.split("/")[2]!.replace(/\.\w+$/, "");
    const reproduced = decodeConfig(changed.owner, repo, url.searchParams);

    expect(reproduced.theme).toBe("dark");
    expect(reproduced.font).toBe("mono");
    expect(reproduced.pattern).toBe("dots");
  });
});
