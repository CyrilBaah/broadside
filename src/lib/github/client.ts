import { Octokit } from "@octokit/rest";

/**
 * FR-003a: authenticate to the GitHub REST API with a server-side credential
 * rather than making unauthenticated requests, since anonymous shared traffic
 * across many repos would exceed the public 60 req/hr/IP limit almost
 * immediately (research.md §3). This token is a deployment secret — it
 * authenticates the app to GitHub, never a user, and must never be exposed to
 * the client or logged (plan.md Constitution Check note).
 */

let client: Octokit | undefined;

export function getGitHubClient(): Octokit {
  if (client) return client;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set. A server-side GitHub credential is required (FR-003a) — see .env.local.example.",
    );
  }

  client = new Octokit({ auth: token });
  return client;
}

/** Test-only seam: allows tests to inject a fake Octokit instance. */
export function setGitHubClientForTesting(testClient: Octokit | undefined): void {
  client = testClient;
}
