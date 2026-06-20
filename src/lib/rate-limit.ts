/**
 * FR-018: a per-IP rate limit on the public, unauthenticated image endpoint.
 * Fixed-window counter, in-memory (acceptable for this app's single-instance
 * deployment scale per plan.md). Exceeding the limit MUST NOT produce an
 * error response — callers fall back to cached/placeholder content instead
 * (route.ts), preserving the endpoint's "always 200" contract so embeds
 * already placed elsewhere never break.
 */

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 60;

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Returns true if the request from `key` (typically an IP) is within the limit. */
export function allowRequest(key: string, now: number = Date.now()): boolean {
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  existing.count += 1;
  return existing.count <= RATE_LIMIT_MAX_REQUESTS;
}

/** Test-only: clears all tracked windows. */
export function resetRateLimiter(): void {
  windows.clear();
}
