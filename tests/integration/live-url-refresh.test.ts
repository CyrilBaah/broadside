import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRepoStatsCacheForTesting, getRepoStatsSnapshot } from "@/lib/cache/repo-stats-cache";
import * as statsModule from "@/lib/github/stats";

const FIRST = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 100, forks: 10, openIssues: 1, primaryLanguage: "TypeScript", openPullRequests: 1 },
};
const UPDATED = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 200, forks: 20, openIssues: 2, primaryLanguage: "TypeScript", openPullRequests: 2 },
};

/**
 * FR-009: a live URL re-renders the repo's current stats on each access,
 * subject to the cache TTL (FR-011) — embedded cards stay reasonably current
 * without the user taking any action (US3 Acceptance Scenario 2).
 */
describe("live URL reflects stat changes within the cache TTL (FR-009)", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serves the same cached stats on repeated access within the TTL", async () => {
    const fetchSpy = vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(FIRST);

    const first = await getRepoStatsSnapshot("vercel", "next.js");
    const second = await getRepoStatsSnapshot("vercel", "next.js");

    expect(first.stats).toEqual(FIRST.stats);
    expect(second.stats).toEqual(FIRST.stats);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("picks up updated stats once the cache entry expires", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValueOnce(FIRST);
    const first = await getRepoStatsSnapshot("vercel", "next.js");
    expect(first.stats).toEqual(FIRST.stats);

    // Simulate TTL expiry by re-seeding the entry far enough in the past.
    const { seedRepoStatsCacheForTesting } = await import("@/lib/cache/repo-stats-cache");
    seedRepoStatsCacheForTesting("vercel", "next.js", FIRST, Date.now() - 20 * 60 * 1000);

    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValueOnce(UPDATED);
    const second = await getRepoStatsSnapshot("vercel", "next.js");

    expect(second.status).toBe("fresh");
    expect(second.stats).toEqual(UPDATED.stats);
  });
});
