# Implementation Plan: Repo Announcement Card Generator

**Branch**: `001-repo-card-generator` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/docs/specs/001-repo-card-generator/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single Next.js web app that lets a user paste a public GitHub repo URL, see an
immediate live preview of an announcement card (name, description, stats), customize
it (theme, font, pattern, layout template, logo, description override) with the full
configuration encoded in the URL, and export it as either a stable live-link image
or a static PNG/JPEG/WebP download — with no accounts and no broken/blank states even
when the GitHub API is unavailable (last-known-good cache fallback).

**Scope addition (2026-06-20)**: gap analysis against a reference competitor's
customization panel (Socialify) surfaced three missing customization capabilities,
now covered by FR-015/FR-016/FR-017 in spec.md: setting the logo via a pasted image
URL/data URI as an alternative to file upload, a visual language icon (with manual
override) alongside the existing text label, and independent show/hide toggles for
each card field (name, owner, language, stars, forks, issues, pull requests,
description). Everything else the reference panel showed (repository field, theme,
font, background pattern) was already covered by FR-004/FR-005.

## Technical Context

**Language/Version**: TypeScript on Node.js (Next.js App Router) — exact Next.js/Node
versions to be the latest stable releases per Constitution IV, confirmed via Context7
at implementation time (Constitution V).

**Primary Dependencies**: Next.js (UI + Route Handlers in one app), an SVG-template
image renderer such as `satori` (+ a raster export step) for PNG/JPEG/WebP output, and
Octokit (GitHub's official REST client) for fetching repo stats — see research.md for
rationale. `lucide-react` (already a dependency, used for the rest of the UI's icons)
has no per-programming-language brand icons, so FR-016's language icon set needs its
own small bundled SVG asset — see research.md §5 (NEEDS CLARIFICATION resolved) for
the chosen source/approach.

**Storage**: N/A — no database (per PRD §5). Repo stats use a short-TTL in-memory/edge
cache with last-known-good fallback (FR-011/FR-012); card configuration is not
persisted server-side, only encoded in the shareable URL (FR-008), using a canonical
lowercase `owner/repo` cache key (FR-001). A server-side GitHub token/App credential
(FR-003a) is held as a deployment secret/environment variable — not a database
record, and not a user-facing account.

**Testing**: Vitest for unit/integration tests (rendering, cache/fallback logic,
config encode/decode, GitHub client), Playwright for an end-to-end core-loop test
(paste → preview → customize → export) — see research.md for rationale.

**Target Platform**: Web — browser UI plus a serverless/edge image-generation
endpoint, hosted on a platform with a generous free tier for edge functions/image
generation (per PRD §5; specific platform left to implementation, not a design gate).

**Project Type**: Web application — single Next.js app serving both the
configuration UI and the image-generation endpoint (no separate frontend/backend
split; PRD §5 explicitly calls for one app).

**Performance Goals**: Live preview appears in under 3s after a valid URL is entered
(SC-001); full preview-to-export flow completes in under 2 minutes (SC-002).

**Constraints**: No accounts, no database, no background workers, no
containerization (PRD §5); stats cache TTL target 10–15 minutes with mandatory
last-known-good fallback rather than blank/broken output (FR-011/FR-012, PRD §4);
GitHub stats fetching MUST use a server-side credential, not unauthenticated
requests, to avoid the 60 req/hr/IP public rate limit (FR-003a); logo uploads
capped at 2MB, PNG/JPEG/WebP/SVG only (FR-006); non-Latin repo text rendered
best-effort, never blocking or blanking the card (Edge Cases). A pasted logo
URL/data URI (FR-015) cannot be size-checked the same way a local file upload
can — validate it is a syntactically valid URL or `data:image/...` URI and that
satori/sharp can decode it at render time, rejecting with the same clear-error
contract as FR-006/FR-014 otherwise, rather than enforcing a byte-size cap
client-side.

**Scale/Scope**: One feature covering the full v1 core loop; three layout templates;
stateless per-request rendering keyed off a public repo URL — no user-concurrency
target beyond "fits a generous serverless free tier."

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality** — PASS. Plan isolates single-responsibility modules (GitHub
  client, cache/fallback layer, rendering function, config encode/decode) and routes
  all non-trivial changes through peer review as usual; no direct-to-main pushes.
- **II. Testing Standards** — PASS. Unit + integration + e2e coverage is planned
  for every functional area (rendering, caching/fallback, config round-trip, core
  loop); `/speckit-tasks` will turn this into concrete, deterministic, isolated test
  tasks.
- **III. UX Consistency** — PASS, with a note: this is the project's first feature,
  so there is no pre-existing design system to conform to. The UI built here
  (including explicit error/loading/empty states required by spec edge cases)
  becomes the initial design system baseline; no violation, since "follow the
  established design system" has nothing to diverge from yet.
- **IV. Latest Packages** — PASS. Next.js, satori (or equivalent), and Octokit
  versions will be pinned at their current latest stable releases when the
  lockfile is created, with maintenance/security evaluated per principle.
- **V. Context7 for Docs** — PASS. Research phase and implementation will consult
  Context7 for current Next.js, satori/image-rendering, and Octokit API docs rather
  than relying on training data.
- **VI. Reuse Over Reinvention** — PASS. Chosen approach explicitly reuses
  established libraries (satori-class renderer, Octokit) instead of hand-rolling an
  SVG renderer or a GitHub HTTP client; see research.md for alternatives considered.

**Note on FR-003a (server-side GitHub credential)**: this is a backend-only secret
(environment variable / platform secret store), never exposed to the client or
logged, and authenticates the *app* to GitHub — not a user. It introduces no UI
surface (no re-check needed against III) and no user-facing account (no conflict
with the no-accounts principle).

**Note on FR-015/FR-016/FR-017 (2026-06-20 scope addition)**: re-evaluated against
all six principles — PASS, no new violations. FR-016's language icon set reuses an
existing maintained open-source icon source rather than hand-drawn icons (VI); all
three additions extend the existing `RepoCardConfig` shape and `CustomizationPanel`
UI vocabulary (III) rather than introducing a new pattern, and each ships with its
own unit/e2e coverage per `/speckit-tasks` (II).

No violations identified; Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
docs/specs/001-repo-card-generator/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (config-ui)/         # repo URL input + live preview + customization UI
│   └── api/
│       └── card/             # image-generation Route Handler (live URL + download)
├── components/
│   ├── card-preview/          # live preview rendering of the current configuration
│   └── customization-panel/   # theme/font/pattern/template/logo/description controls
└── lib/
    ├── github/                 # Octokit-based repo stats fetching
    ├── cache/                  # short-TTL cache + last-known-good fallback
    ├── render/                 # template + params + cached stats → SVG → PNG/JPEG/WebP
    │   └── language-icons/     # bundled per-language SVG icon set (FR-016)
    └── config/                 # encode/decode shareable card configuration from URL params

tests/
├── unit/        # render, cache/fallback, config encode/decode
├── integration/ # GitHub fetch + cache + fallback behavior end to end
└── e2e/         # core loop: paste URL → preview → customize → export
```

**Structure Decision**: Single Next.js application under `src/`, per PRD §5's
explicit requirement for one app serving both the configuration UI and the
image-generation endpoint. No frontend/backend split is used since Next.js Route
Handlers cover the "backend" half (image generation) within the same project and
deployment unit.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check violations were identified for this feature; this table is
intentionally left empty.
