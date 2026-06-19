# Research: Repo Announcement Card Generator

All Technical Context items from [plan.md](./plan.md) are resolved below; no
`NEEDS CLARIFICATION` markers remain.

## 1. Application framework

- **Decision**: Next.js (App Router), single app serving both the configuration UI
  and the image-generation endpoint via Route Handlers.
- **Rationale**: PRD §5 explicitly mandates one web app for both surfaces, with no
  separate backend service. Next.js Route Handlers run in the same project/deploy
  unit as the UI and support edge/serverless execution, satisfying the "no
  containerization, no background workers" constraint.
- **Alternatives considered**: A separate SPA + standalone serverless API (rejected
  — two deployable units adds operational complexity the PRD explicitly avoids for
  v1); a plain Node HTTP server (rejected — reinvents routing/SSR Next.js already
  provides, violating Constitution VI Reuse Over Reinvention).

## 2. Card image rendering

- **Decision**: An SVG-template-based renderer (the `satori` family of libraries,
  or a managed wrapper such as `@vercel/og` built on it) to turn
  `(template, params, cachedRepoStats)` into SVG, then to PNG/JPEG/WebP for export.
- **Rationale**: Purpose-built for exactly this "JSX/HTML-like layout → raster
  image" use case at the edge; actively maintained; avoids hand-building a layout
  and text-wrapping engine from scratch (Constitution VI). Matches PRD §5's
  "one rendering function" architecture directly.
- **Alternatives considered**: Canvas-based manual drawing (rejected — requires
  reimplementing flex-like layout, font metrics, and text wrapping by hand);
  headless-browser screenshotting, e.g. Puppeteer (rejected — too heavy for a
  serverless/edge function and far slower than SVG-based rendering, hurting SC-001's
  <3s preview target).

## 3. GitHub stats fetching

- **Decision**: Octokit, GitHub's official REST client, to fetch stars, forks, open
  issues, primary language, and open PR count — authenticated with a server-side
  GitHub token/App credential (FR-003a), not unauthenticated requests.
- **Rationale**: Official, well-maintained client that already handles
  authentication headers, pagination, and rate-limit response parsing — exactly the
  kind of solved problem Constitution VI says not to reinvent. Authentication is
  required because unauthenticated GitHub REST requests are capped at 60/hr per
  source IP, which a shared anonymous service serving many distinct repos would
  exceed almost immediately; an authenticated app-level token raises this to
  5,000+/hr. This credential is a deployment secret authenticating the app to
  GitHub — it does not introduce end-user accounts or sign-in (clarified
  2026-06-19, see spec.md Clarifications).
- **Alternatives considered**: Raw `fetch` calls against the GitHub REST API
  (rejected — would mean re-implementing rate-limit/error parsing Octokit already
  provides, for no benefit); staying unauthenticated (rejected — 60 req/hr/IP is
  not viable for shared anonymous traffic across many repos, even with caching).

## 4. Stats caching & fallback

- **Decision**: A short-TTL (10–15 min) in-memory/edge cache keyed by repo, storing
  the last successfully fetched stats snapshot; on fetch failure, serve that cached
  snapshot; if none exists yet, render a defined placeholder state.
- **Rationale**: Directly implements FR-011/FR-012 and PRD §4's reliability
  requirement, and respects PRD §5's "no database" constraint — no external cache
  service needed for v1 scale.
- **Alternatives considered**: External cache (Redis/Memcached) (rejected — adds
  infrastructure and ops burden PRD §5 explicitly rules out for v1); no caching at
  all (rejected — violates the explicit last-known-good reliability requirement in
  PRD §4 / FR-011).

## 5. Shareable configuration encoding

- **Decision**: Encode the full card configuration (repo, theme, font, pattern,
  template, logo reference, description override) as URL query parameters, as
  already specified in PRD §3.1's example URL shape.
- **Rationale**: Query parameters are inherently shareable, scriptable, and require
  no server-side state — directly satisfying the no-accounts principle and FR-008.
- **Alternatives considered**: Server-stored config with a short ID (rejected —
  reintroduces a database and a pseudo-account concept the PRD explicitly rejects
  for v1).

## 6. Testing tooling

- **Decision**: Vitest for unit and integration tests (rendering, cache/fallback,
  config encode/decode, GitHub client behavior); Playwright for an end-to-end test
  of the core loop.
- **Rationale**: Both are current, fast, well-maintained tools with strong
  TypeScript/Next.js support, fitting Constitution II's determinism/speed
  requirements and Constitution IV's "latest stable" preference.
- **Alternatives considered**: Jest (rejected — slower default config for an
  ESM/TS-first Next.js project; Vitest is the more current equivalent for this
  stack).

## 7. Repo URL canonicalization

- **Decision**: Normalize input repo URLs to a canonical lowercase `owner/repo`
  form — stripping protocol, trailing slash, and `.git` suffix — before using the
  value as a cache key or embedding it in the shareable config URL (FR-001).
- **Rationale**: GitHub repo paths are case-insensitive for routing purposes;
  without normalization, equivalent URLs in different forms (`https://github.com/Foo/Bar/`
  vs `github.com/foo/bar.git`) would fragment the stats cache and break the
  shareable-URL reproducibility guarantee in SC-005 (clarified 2026-06-19).
- **Alternatives considered**: Accepting URLs as-typed with no normalization
  (rejected — directly undermines SC-005 and wastes cache capacity on duplicate
  entries for the same repo).

## 8. Non-Latin text rendering

- **Decision**: Render repo names/descriptions containing non-Latin scripts
  (CJK, Arabic, etc.) using the chosen rendering library's default text support,
  with no script-specific special-casing or blocking in v1.
- **Rationale**: PRD §6 explicitly defers full i18n/CJK/RTL shaping correctness to
  a post-v1 phase while still requiring the card to never render blank or broken
  for such text (clarified 2026-06-19) — best-effort rendering satisfies both
  constraints without taking on i18n-correctness scope this feature doesn't need.
- **Alternatives considered**: Fallback placeholder for unsupported scripts
  (rejected — adds detection complexity for marginal benefit when best-effort
  rendering already avoids broken output); rejecting such repos outright
  (rejected — directly contradicts the "reliable by default" PRD principle and
  excludes a large class of real repos from the product).

## 9. Logo upload limits

- **Decision**: Cap logo uploads at 2MB, restricted to PNG, JPEG, WebP, and SVG.
- **Rationale**: Generous enough for a typical logo while bounding render latency
  and abuse surface (clarified 2026-06-19); the four formats cover standard web
  image types plus SVG for crisp vector logos.
- **Alternatives considered**: 5MB / broader format set (rejected — higher abuse
  and latency risk for marginal benefit); leaving limits unspecified (rejected —
  FR-006 needs a concrete, testable threshold).

## 10. Hosting platform

- **Decision**: Deferred to implementation — any platform offering a generous free
  tier for edge/serverless functions and image generation satisfies PRD §5; exact
  choice is not a design-time blocker.
- **Rationale**: Hosting choice doesn't affect the feature's architecture or
  contracts as designed; verifying the chosen platform's current capabilities via
  Context7 happens at implementation time per Constitution V.
- **Alternatives considered**: N/A — intentionally left open per PRD §5's framing
  ("a platform," not a named one).
