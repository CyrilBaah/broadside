import { fetchRepoData, type RepoData, type RepoMeta, type RepoStats } from "../github/stats";

/** data-model.md: Repo Stats Snapshot status, driving which UI state renders. */
export type SnapshotStatus = "fresh" | "stale-fallback" | "never-fetched";

export interface RepoStatsSnapshot {
  status: SnapshotStatus;
  meta: RepoMeta | null;
  stats: RepoStats | null;
  fetchedAt: number | null;
}

const TTL_MS = 12 * 60 * 1000; // 10-15 min target (FR-011); 12 min midpoint.

interface CacheEntry {
  data: RepoData;
  fetchedAt: number;
}

/**
 * In-memory short-TTL cache keyed by normalized "owner/repo" (FR-001), per research.md §4:
 * no database (PRD §5) — last-known-good fallback lives in process memory / the
 * hosting platform's equivalent edge cache.
 */
const cache = new Map<string, CacheEntry>();

function cacheKey(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < TTL_MS;
}

function toSnapshot(status: SnapshotStatus, entry: CacheEntry | undefined): RepoStatsSnapshot {
  return {
    status,
    meta: entry?.data.meta ?? null,
    stats: entry?.data.stats ?? null,
    fetchedAt: entry?.fetchedAt ?? null,
  };
}

/**
 * FR-011/FR-012: returns fresh stats when available; on fetch failure, falls
 * back to the last successfully cached snapshot; if none exists, reports
 * "never-fetched" so the caller can render a placeholder rather than blank
 * or broken output.
 */
export async function getRepoStatsSnapshot(owner: string, repo: string): Promise<RepoStatsSnapshot> {
  const key = cacheKey(owner, repo);
  const existing = cache.get(key);

  if (existing && isFresh(existing)) {
    return toSnapshot("fresh", existing);
  }

  try {
    const data = await fetchRepoData(owner, repo);
    const entry: CacheEntry = { data, fetchedAt: Date.now() };
    cache.set(key, entry);
    return toSnapshot("fresh", entry);
  } catch (error) {
    if (existing) {
      return toSnapshot("stale-fallback", existing);
    }
    if (isNotFoundError(error)) {
      throw error;
    }
    return toSnapshot("never-fetched", undefined);
  }
}

/**
 * FR-018: when a client has exceeded the per-IP rate limit, the route handler
 * uses this instead of getRepoStatsSnapshot to avoid triggering a fresh
 * GitHub fetch — serves whatever's already cached (fresh or stale) or
 * "never-fetched" if nothing is cached yet, never erroring.
 */
export function peekRepoStatsSnapshot(owner: string, repo: string): RepoStatsSnapshot {
  const key = cacheKey(owner, repo);
  const existing = cache.get(key);
  if (!existing) return toSnapshot("never-fetched", undefined);
  return toSnapshot(isFresh(existing) ? "fresh" : "stale-fallback", existing);
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: string }).name === "RepoNotFoundError"
  );
}

/** Test-only seam: clears all cached entries between test cases. */
export function clearRepoStatsCacheForTesting(): void {
  cache.clear();
}

/** Test-only seam: seeds a cache entry directly, bypassing a real fetch. */
export function seedRepoStatsCacheForTesting(
  owner: string,
  repo: string,
  data: RepoData,
  fetchedAt: number = Date.now(),
): void {
  cache.set(cacheKey(owner, repo), { data, fetchedAt });
}
