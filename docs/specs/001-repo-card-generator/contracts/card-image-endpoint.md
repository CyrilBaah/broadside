# Contract: Card Image Endpoint

The only externally-facing contract this feature exposes: a single endpoint that
renders a card image from a repo and a configuration. Both the "live link" output
(FR-009) and the "static download" output (FR-010) are the same endpoint —
the live link is simply this URL embedded persistently elsewhere; the static
download is the same response saved as a file by the user/browser.

## Request

```
GET /{owner}/{repo}.{ext}
```

| Part | Description |
|---|---|
| `owner` | GitHub repo owner/org; server normalizes to lowercase before lookup/caching (FR-001) |
| `repo` | GitHub repo name; server normalizes to lowercase, `.git` suffix stripped if present (FR-001) |
| `ext` | One of `png`, `jpg`/`jpeg`, `webp` — selects the export format (FR-010) |

Stats are fetched from the GitHub API using a server-side credential (FR-003a),
never exposed in this request/response contract — it's an internal implementation
detail of the endpoint's GitHub-fetch step, invisible to callers.

**Query parameters** (all optional; absence = default per data-model.md):

| Param | Maps to | Notes |
|---|---|---|
| `theme` | `theme` | |
| `font` | `font` | |
| `pattern` | `pattern` | |
| `template` | `template` | `default` \| `minimal` \| `stats-forward` |
| `logo` | `logo` | Either a reference to an uploaded logo asset (PNG/JPEG/WebP/SVG, max 2MB — FR-006) or a directly pasted image URL/data URI (FR-015); invalid/unsupported values are rejected before a usable reference is ever issued |
| `languageIcon` | `languageIcon` | Optional override of which language icon renders (FR-016); unrecognized values are ignored, falling back to auto-derived-from-stats behavior |
| `fields` | `visibleFields` | Optional comma-separated subset of `name,owner,language,stars,forks,issues,pullRequests,description` (FR-017); absent → all fields visible (today's default behavior, preserving existing shared links per SC-005); unknown tokens are ignored rather than rejected |
| `description` | `descriptionOverride` | |

Example (from PRD §3.1): `broadside.dev/{owner}/{repo}.png?theme=Dark&pattern=Circuit&template=Minimal`

Example with the 2026-06-20 additions: `broadside.dev/{owner}/{repo}.png?logo=https%3A%2F%2Fexample.com%2Flogo.svg&languageIcon=typescript&fields=name,stars,forks,description`

## Response

- **200 OK** — image body in the requested format, `Content-Type` matching `ext`.
  Reflects either fresh GitHub stats or, per FR-011, the last-known-good cached
  snapshot if the live fetch failed. Cache-control headers set to align with the
  10–15 min stats TTL (research.md §4) so the live-link use case (FR-009) stays
  reasonably current without re-fetching GitHub on every view.
- **200 OK with placeholder content** — when no successful fetch has ever occurred
  for this repo (`status: never-fetched` in data-model.md), the image still renders
  at 200 with a clear placeholder visual rather than erroring (FR-012). This keeps
  embeds (e.g. in a README) from showing a broken-image icon.
- **200 OK, always — even for errors**: unparseable `owner`/`repo`, unsupported
  `ext`, or a repo that is private/nonexistent (FR-001, FR-014) all render a clear
  "couldn't load" card and return status 200, never a 4xx/5xx. Corrected during
  implementation: browsers treat any non-2xx `<img src>` response as a broken
  image regardless of body content, so a real 404/500 would defeat FR-012/FR-014's
  "never a broken card" guarantee for the primary consumer of this endpoint — a
  bare `<img>`/Markdown embed in someone's README has no other channel to receive
  an error through. The image content is the only error signal this endpoint has.
- Non-Latin repo names/descriptions (CJK, Arabic, etc.) are not an error case —
  they render best-effort via the rendering library's default text support
  (clarified 2026-06-19); the endpoint never 4xxs solely because the text isn't
  Latin script.

## Configuration UI (not a network contract)

The customization UI (theme/font/pattern/template/logo/description controls) does
not need its own contract — it writes to the same query-parameter shape on the
client, then either links to this endpoint (live URL output, FR-009) or fetches it
to offer to the user as a downloadable file (static export, FR-010). No separate
API is exposed for the UI beyond consuming this one endpoint.

## Copy-paste embed snippets (FR-009a)

Derived client-side from the same endpoint URL — no separate endpoint. Given the
fully-resolved endpoint URL `U` and the rendered repo's name as `alt`:

| Snippet | Form |
|---|---|
| Raw URL | `U` |
| Markdown | `![alt](U)` |
| HTML | `<img src="U" alt="alt">` |

Each is exposed as a one-click "copy" action in the export UI so it can be pasted
directly into a README.
