# Quickstart: Repo Announcement Card Generator

Validation guide for proving the feature works end to end. See
[data-model.md](./data-model.md) for field details and
[contracts/card-image-endpoint.md](./contracts/card-image-endpoint.md) for the
endpoint shape.

## Prerequisites

- Node.js (latest LTS) and the project's package manager installed.
- Dependencies installed (`npm install` or equivalent) once the implementation
  exists.
- A GitHub token/App credential set as a local environment variable (FR-003a) —
  required even for local dev, since the GitHub client always authenticates
  server-side rather than making unauthenticated requests.

## Setup

```bash
npm install
npm run dev
```

## Validation scenarios

1. **Core loop (User Story 1 + 3, P1)**
   - Open the running app, paste a known public repo URL (e.g.
     `https://github.com/vercel/next.js`).
   - Expect: a live preview renders within a few seconds showing name,
     description, and stats with default styling (SC-001).
   - Request the live URL output; open it in a new tab/incognito session and
     confirm it renders the same card independently (FR-009).
   - Confirm the export UI offers one-click copy for the raw URL, a Markdown
     image snippet, and an HTML `<img>` tag (FR-009a); paste each into a test
     README/Markdown preview and confirm it renders the card correctly.
   - Request a static download; confirm a valid PNG/JPEG/WebP file is produced
     matching the preview (FR-010).

2. **Customization (User Story 2, P2)**
   - With a card rendered, change theme, font, pattern, and layout template one
     at a time; confirm the preview updates immediately after each change.
   - Upload a logo image; confirm it replaces the default icon in the preview.
   - Override the description text; confirm it replaces the GitHub description.
   - Copy the resulting shareable URL and open it in a separate browser/session;
     confirm it reproduces the identical customized card (SC-005).

3. **Reliability / fallback behavior (FR-011, FR-012)**
   - Generate a card for a repo successfully at least once (so a cached snapshot
     exists).
   - Simulate a GitHub API failure (e.g. via a test double or by temporarily
     blocking the GitHub API in a test environment) and reload the card's live
     URL; confirm it still renders using the last-known-good cached stats rather
     than a blank or broken badge.
   - Request a card for a repo that has never been successfully fetched (with the
     GitHub API simulated as unreachable); confirm a clear placeholder renders
     instead of a blank/broken layout (FR-012).

4. **Invalid input handling (FR-014)**
   - Submit a malformed URL, a non-GitHub URL, and a private/nonexistent repo URL.
   - Confirm each produces a clear, friendly error rather than a broken or blank
     card.

5. **URL normalization (FR-001)**
   - Submit the same repo via several equivalent URL forms (with/without
     `https://`, with/without trailing slash, with/without `.git`, mixed case
     owner/repo).
   - Confirm all forms resolve to the identical card and the identical normalized
     shareable URL.

6. **Logo upload limits (FR-006)**
   - Attempt to upload a file over 2MB and a file of an unsupported type (e.g.
     `.gif` or `.txt`); confirm both are rejected with a clear error and the prior
     logo state is retained.
   - Upload a valid PNG/JPEG/WebP/SVG under 2MB; confirm it's accepted and
     displayed.

7. **Non-Latin text rendering**
   - Generate a card for a repo whose name or description contains non-Latin
     characters (e.g. a repo with a CJK description); confirm the card still
     renders (best-effort) rather than appearing blank or broken.

8. **No-login check (FR-013, SC-004)**
   - Walk through the entire core loop (preview → customize → export) and confirm
     no step prompts for sign-in, registration, or any account-identifying
     information.

## Automated checks

Once implemented, the equivalent of each scenario above should exist as:
- Unit tests for rendering, cache/fallback, and config encode/decode (`tests/unit`).
- An integration test for the GitHub fetch + cache + fallback chain
  (`tests/integration`).
- An end-to-end test covering the full core loop (`tests/e2e`), per Constitution
  II's testing standards.
