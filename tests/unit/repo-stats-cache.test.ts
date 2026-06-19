import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRepoStatsCacheForTesting,
  getRepoStatsSnapshot,
  seedRepoStatsCacheForTesting,
} from "@/lib/cache/repo-stats-cache";
import * as statsModule from "@/lib/github/stats";
import { RepoNotFoundError } from "@/lib/github/stats";

const SAMPLE_DATA = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 100, forks: 10, openIssues: 2, primaryLanguage: "TypeScript", openPullRequests: 3 },
};

describe("getRepoStatsSnapshot (FR-011, FR-012)", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'never-fetched' when there's no cache and the fetch fails", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockRejectedValue(new Error("network down"));

    const snapshot = await getRepoStatsSnapshot("vercel", "next.js");

    expect(snapshot.status).toBe("never-fetched");
    expect(snapshot.stats).toBeNull();
    expect(snapshot.meta).toBeNull();
  });

  it("returns 'fresh' on a successful fetch", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    const snapshot = await getRepoStatsSnapshot("vercel", "next.js");

    expect(snapshot.status).toBe("fresh");
    expect(snapshot.stats).toEqual(SAMPLE_DATA.stats);
    expect(snapshot.meta).toEqual(SAMPLE_DATA.meta);
  });

  it("falls back to 'stale-fallback' with the last-known-good data when a later fetch fails", async () => {
    seedRepoStatsCacheForTesting("vercel", "next.js", SAMPLE_DATA, Date.now() - 20 * 60 * 1000); // expired

    vi.spyOn(statsModule, "fetchRepoData").mockRejectedValue(new Error("network down"));

    const snapshot = await getRepoStatsSnapshot("vercel", "next.js");

    expect(snapshot.status).toBe("stale-fallback");
    expect(snapshot.stats).toEqual(SAMPLE_DATA.stats);
  });

  it("serves cached data without re-fetching while still within the TTL", async () => {
    seedRepoStatsCacheForTesting("vercel", "next.js", SAMPLE_DATA, Date.now());
    const fetchSpy = vi.spyOn(statsModule, "fetchRepoData");

    const snapshot = await getRepoStatsSnapshot("vercel", "next.js");

    expect(snapshot.status).toBe("fresh");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("propagates RepoNotFoundError instead of falling back to a placeholder (FR-014)", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockRejectedValue(new RepoNotFoundError("vercel", "ghost-repo"));

    await expect(getRepoStatsSnapshot("vercel", "ghost-repo")).rejects.toBeInstanceOf(RepoNotFoundError);
  });
});
