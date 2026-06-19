import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRepoStatsCacheForTesting, getRepoStatsSnapshot } from "@/lib/cache/repo-stats-cache";
import * as statsModule from "@/lib/github/stats";
import { defaultConfigFor } from "@/lib/config/schema";
import { renderCardToSvg } from "@/lib/render/render-card";

const SAMPLES = [
  { label: "CJK", name: "你好世界", description: "测试仓库描述" },
  { label: "Arabic", name: "مرحبا-بالعالم", description: "مستودع تجريبي" },
  { label: "Mixed Latin/CJK/Arabic", name: "next.js 你好 مرحبا", description: null },
];

/**
 * Edge Cases / 2026-06-19 clarification: repo names/descriptions containing
 * non-Latin scripts MUST still render — never blank or broken — even though
 * full i18n/RTL shaping correctness is deferred post-v1 (best-effort only).
 */
describe("non-Latin text rendering (best-effort, never broken)", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(SAMPLES)("renders a card for a $label repo name/description without throwing", async ({ name, description }) => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue({
      meta: { name, description },
      stats: { stars: 1, forks: 0, openIssues: 0, primaryLanguage: null, openPullRequests: 0 },
    });

    const config = defaultConfigFor("owner", "repo");
    const snapshot = await getRepoStatsSnapshot(config.owner, config.repo);

    const svg = await renderCardToSvg({ config, snapshot });

    expect(svg).toContain("<svg");
    expect(svg.length).toBeGreaterThan(500);
  });

  it.each(["minimal", "stats-forward"] as const)(
    "also renders non-Latin text in the %s template",
    async (template) => {
      vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue({
        meta: { name: "你好世界", description: "مرحبا بالعالم" },
        stats: { stars: 1, forks: 0, openIssues: 0, primaryLanguage: null, openPullRequests: 0 },
      });

      const config = { ...defaultConfigFor("owner", "repo"), template };
      const snapshot = await getRepoStatsSnapshot(config.owner, config.repo);

      const svg = await renderCardToSvg({ config, snapshot });

      expect(svg).toContain("<svg");
    },
  );
});
