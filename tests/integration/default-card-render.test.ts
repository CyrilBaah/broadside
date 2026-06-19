import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRepoStatsCacheForTesting, getRepoStatsSnapshot } from "@/lib/cache/repo-stats-cache";
import * as statsModule from "@/lib/github/stats";
import { defaultConfigFor } from "@/lib/config/schema";
import { renderCardToSvg } from "@/lib/render/render-card";
import { exportImage } from "@/lib/render/export-image";

const SAMPLE_DATA = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 140000, forks: 29000, openIssues: 1500, primaryLanguage: "JavaScript", openPullRequests: 250 },
};

describe("Default card render end-to-end (FR-002, FR-003, SC-001)", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a default-styled card with name, description, and stats from a valid repo", async () => {
    const config = defaultConfigFor("vercel", "next.js");
    const snapshot = await getRepoStatsSnapshot(config.owner, config.repo);

    expect(snapshot.status).toBe("fresh");

    const svg = await renderCardToSvg({ config, snapshot });

    // satori draws text as vector path glyphs, not literal <text> nodes, so we
    // assert on SVG structure/dimensions rather than literal string content.
    expect(svg).toContain("<svg");
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg.length).toBeGreaterThan(1000);
  });

  it("produces a valid PNG export from the rendered SVG (FR-010 base case)", async () => {
    const config = defaultConfigFor("vercel", "next.js");
    const snapshot = await getRepoStatsSnapshot(config.owner, config.repo);
    const svg = await renderCardToSvg({ config, snapshot });

    const png = await exportImage(svg, "png");

    // PNG file signature: 89 50 4E 47 0D 0A 1A 0A
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  });

  it("uses the default theme/font/pattern/template when none are specified", () => {
    const config = defaultConfigFor("vercel", "next.js");

    expect(config.theme).toBe("light");
    expect(config.pattern).toBe("none");
    expect(config.template).toBe("default");
    expect(config.font).toBe("system");
  });
});
