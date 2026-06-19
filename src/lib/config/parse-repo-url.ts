/**
 * FR-001: parse a public GitHub repo URL (or bare "owner/repo") and normalize it to a
 * canonical lowercase "owner/repo" form — stripping protocol, trailing slash, and
 * a trailing ".git" suffix — so equivalent URLs always map to the same cache entry
 * and shareable config (clarified 2026-06-19, see spec.md Clarifications).
 */

export class InvalidRepoUrlError extends Error {
  constructor(input: string) {
    super(`"${input}" is not a valid GitHub repository URL.`);
    this.name = "InvalidRepoUrlError";
  }
}

// GitHub owner (user/org) names: alphanumeric and hyphens only, no leading/trailing hyphen.
const OWNER_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
// GitHub repo names additionally allow dots and underscores (e.g. "next.js").
const REPO_PATTERN = /^[a-z0-9._-]+$/i;

export interface ParsedRepo {
  owner: string;
  repo: string;
}

/**
 * Accepts forms like:
 *   https://github.com/Owner/Repo
 *   github.com/Owner/Repo/
 *   Owner/Repo.git
 * Returns the normalized, lowercase { owner, repo }, or throws InvalidRepoUrlError.
 */
export function parseRepoUrl(input: string): ParsedRepo {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new InvalidRepoUrlError(input);
  }

  // Strip protocol and an optional "github.com/" host segment.
  let rest = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  rest = rest.replace(/^(www\.)?github\.com\//i, "");

  // Strip a leading slash, trailing slash, and a trailing ".git" suffix.
  rest = rest.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.git$/i, "");

  const segments = rest.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new InvalidRepoUrlError(input);
  }

  const ownerRaw = segments[0];
  const repoRaw = segments[1];
  if (!ownerRaw || !repoRaw) {
    throw new InvalidRepoUrlError(input);
  }
  const owner = ownerRaw.toLowerCase();
  const repo = repoRaw.toLowerCase();

  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) {
    throw new InvalidRepoUrlError(input);
  }

  return { owner, repo };
}
