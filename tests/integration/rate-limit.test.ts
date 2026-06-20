import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { clearRepoStatsCacheForTesting } from "@/lib/cache/repo-stats-cache";
import { resetRateLimiter } from "@/lib/rate-limit";
import * as statsModule from "@/lib/github/stats";

// Rendering/rasterizing a real SVG→PNG 60+ times per test is too slow for a
// unit-speed suite; this test only exercises the rate-limit decision itself,
// which is already independent of what the render pipeline produces.
vi.mock("@/lib/render/export-image", () => ({
  exportImage: vi.fn().mockResolvedValue(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  contentTypeFor: () => "image/png",
}));
vi.mock("@/lib/render/render-card", () => ({
  renderCardToSvg: vi.fn().mockResolvedValue("<svg/>"),
  renderErrorCardToSvg: vi.fn().mockResolvedValue("<svg/>"),
}));

const { GET } = await import("@/app/[owner]/[repo]/route");

const SAMPLE_DATA = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 1, forks: 1, openIssues: 1, primaryLanguage: "TypeScript", openPullRequests: 1 },
};

/**
 * FR-018: the per-IP rate limit must never produce a 4xx/5xx — a client
 * exceeding it still gets a usable (cached/placeholder) response, since
 * embeds already placed elsewhere (e.g. in a README) must never break.
 */
describe("per-IP rate limit on the card image endpoint (FR-018)", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
    resetRateLimiter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function callRoute(ip: string) {
    const request = new NextRequest("https://example.com/vercel/next.js.png", {
      headers: { "x-forwarded-for": ip },
    });
    return GET(request, { params: Promise.resolve({ owner: "vercel", repo: "next.js.png" }) });
  }

  it("still returns 200 once a single IP exceeds the limit", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    let lastResponse;
    for (let i = 0; i < 65; i++) {
      lastResponse = await callRoute("203.0.113.7");
    }

    expect(lastResponse!.status).toBe(200);
    expect(lastResponse!.headers.get("content-type")).toBe("image/png");
  });

  it("serves cached/placeholder content without calling GitHub again once rate-limited", async () => {
    const fetchSpy = vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    // Clear the stats cache before every call so an "allowed" request would
    // otherwise always re-fetch — isolating what the rate limit itself does.
    for (let i = 0; i < 60; i++) {
      clearRepoStatsCacheForTesting();
      await callRoute("198.51.100.9");
    }
    const callsAtLimit = fetchSpy.mock.calls.length;
    expect(callsAtLimit).toBe(60);

    clearRepoStatsCacheForTesting();
    const response = await callRoute("198.51.100.9");

    expect(response.status).toBe(200);
    expect(fetchSpy.mock.calls.length).toBe(callsAtLimit);
  });

  it("does not rate-limit a different IP", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    for (let i = 0; i < 65; i++) {
      await callRoute("203.0.113.50");
    }

    const response = await callRoute("203.0.113.99");
    expect(response.status).toBe(200);
  });
});
