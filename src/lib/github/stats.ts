import { getGitHubClient } from "./client";

/** data-model.md: the fetched fields of a Repo Stats Snapshot, before caching metadata is added. */
export interface RepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string | null;
  openPullRequests: number;
}

/** Repo metadata needed for rendering, fetched alongside stats (FR-002, FR-007). */
export interface RepoMeta {
  name: string;
  /** GitHub's description, or null if the repo has none (Edge Cases). */
  description: string | null;
}

export interface RepoData {
  meta: RepoMeta;
  stats: RepoStats;
}

export class RepoNotFoundError extends Error {
  constructor(owner: string, repo: string) {
    super(`Repository "${owner}/${repo}" was not found or is not publicly accessible.`);
    this.name = "RepoNotFoundError";
  }
}

/**
 * FR-002/FR-003: fetch repo name/description plus star, fork, open issue,
 * primary language, and open pull request counts in one pass. FR-001/FR-014:
 * throws RepoNotFoundError for private/nonexistent repos rather than
 * returning partial data.
 */
export async function fetchRepoData(owner: string, repo: string): Promise<RepoData> {
  const client = getGitHubClient();

  let repoData;
  try {
    const response = await client.repos.get({ owner, repo });
    repoData = response.data;
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      throw new RepoNotFoundError(owner, repo);
    }
    throw error;
  }

  if (repoData.private) {
    throw new RepoNotFoundError(owner, repo);
  }

  // GitHub's REST "open_issues_count" includes open PRs, so we fetch open PRs
  // separately to report them as a distinct badge.
  const pullsResponse = await client.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 1,
  });
  const openPullRequests = extractTotalCount(pullsResponse);
  const openIssues = Math.max(0, repoData.open_issues_count - openPullRequests);

  return {
    meta: {
      name: repoData.name,
      description: repoData.description,
    },
    stats: {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues,
      primaryLanguage: repoData.language,
      openPullRequests,
    },
  };
}

function isNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { status?: number }).status === 404;
}

function extractTotalCount(response: { data: unknown[]; headers: { link?: unknown } }): number {
  // Octokit doesn't return a total count for list endpoints; for v1 scale, page size
  // is sufficient since we only need an approximate "open PR" badge count, not exact
  // pagination. We use the Link header's "last" page rel when present for accuracy.
  const link = response.headers.link;
  if (typeof link !== "string") return response.data.length;
  const match = /[?&]page=(\d+)>;\s*rel="last"/.exec(link);
  return match ? Number(match[1]) : response.data.length;
}
