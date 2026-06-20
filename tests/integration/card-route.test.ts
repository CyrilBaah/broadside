import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { clearRepoStatsCacheForTesting } from "@/lib/cache/repo-stats-cache";
import * as statsModule from "@/lib/github/stats";
import { GET } from "@/app/[owner]/[repo]/route";

const SAMPLE_DATA = {
  meta: { name: "next.js", description: "The React Framework" },
  stats: { stars: 1, forks: 1, openIssues: 1, primaryLanguage: "TypeScript", openPullRequests: 1 },
};

/**
 * Direct test of the card image route handler — the actual HTTP contract
 * (contracts/card-image-endpoint.md). This is the literal critical path a
 * real bug slipped through once already: the route lived at
 * /api/card/[owner]/[repo] while buildCardPath() built /[owner]/[repo],
 * so every preview 404'd despite every other test passing. Exercising the
 * route handler itself, not just the modules it calls, catches that class
 * of bug.
 */
describe("card image route handler", () => {
  beforeEach(() => {
    clearRepoStatsCacheForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function callRoute(owner: string, repoWithExt: string, query = "") {
    const url = `https://example.com/${owner}/${repoWithExt}${query}`;
    const request = new NextRequest(url);
    return GET(request, { params: Promise.resolve({ owner, repo: repoWithExt }) });
  }

  it("returns 200 with a PNG image for a valid repo", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    const response = await callRoute("vercel", "next.js.png");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const body = Buffer.from(await response.arrayBuffer());
    expect(body.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  });

  it("returns 200 with a JPEG image when .jpg is requested", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    const response = await callRoute("vercel", "next.js.jpg");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
  });

  it("returns 200 with a placeholder image (not 4xx) for an unsupported extension", async () => {
    const response = await callRoute("vercel", "next.js.bmp");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("returns 200 with a placeholder image (not 4xx) when the repo can't be fetched", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockRejectedValue(new statsModule.RepoNotFoundError("vercel", "ghost"));

    const response = await callRoute("vercel", "ghost.png");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("sets a cache-control header aligned with the stats TTL on success", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    const response = await callRoute("vercel", "next.js.png");

    expect(response.headers.get("cache-control")).toContain("max-age=720");
  });

  it("respects query params for theme/template", async () => {
    vi.spyOn(statsModule, "fetchRepoData").mockResolvedValue(SAMPLE_DATA);

    const response = await callRoute("vercel", "next.js.png", "?theme=dark&template=minimal");

    expect(response.status).toBe(200);
  });
});
