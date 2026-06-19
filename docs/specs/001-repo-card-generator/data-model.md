# Data Model: Repo Announcement Card Generator

Neither entity below is persisted in a database (PRD §5 explicitly forbids one).
Both exist only as in-memory/edge-cache or request-scoped values.

## Repo Card Configuration

The full set of inputs needed to render a card. Fully represented in a shareable
URL (FR-008); never stored server-side.

| Field | Type | Required | Notes |
|---|---|---|---|
| `owner` | string | yes | GitHub repo owner/org, parsed from the input URL and normalized to lowercase (FR-001) |
| `repo` | string | yes | GitHub repo name, parsed from the input URL, normalized to lowercase with `.git` suffix stripped (FR-001) |
| `theme` | enum | no (default applies) | Color theme; default per Assumptions in spec.md |
| `font` | enum | no (default applies) | Font choice; default is system-standard |
| `pattern` | enum | no (default: none) | Background pattern identifier |
| `template` | enum: `default` \| `minimal` \| `stats-forward` | no (default: `default`) | Layout template (FR-004) |
| `logo` | reference | no | Optional uploaded logo reference; absent → default repo icon |
| `descriptionOverride` | string | no | Optional custom text; absent → GitHub repo description, or no description line if that's also empty (per spec edge cases) |
| `format` | enum: `png` \| `jpeg` \| `webp` | no (only relevant for static download, default: `png`) | Export format (FR-010) |

**Validation rules**:
- `owner`/`repo` are normalized (lowercased, protocol/trailing-slash/`.git` stripped,
  FR-001) before resolution, then must resolve to an existing, public, accessible
  GitHub repository; otherwise the request is rejected per FR-014.
- `logo`, if present, must be PNG, JPEG, WebP, or SVG and no larger than 2MB
  (FR-006); otherwise rejected with the prior logo state retained (per spec edge
  cases).
- Repo name/description text is rendered best-effort regardless of script (CJK,
  Arabic, etc.); no validation rule blocks non-Latin content (per spec edge cases).

## Repo Stats Snapshot

The cached result of a GitHub API fetch for a given repo. Used to serve
last-known-good data when a live fetch fails (FR-011/FR-012).

| Field | Type | Notes |
|---|---|---|
| `owner` / `repo` | string | Cache key, using the normalized lowercase form from FR-001; theme/template are NOT part of the key — stats are per-repo, not per-configuration |
| `stars` | integer | |
| `forks` | integer | |
| `openIssues` | integer | |
| `primaryLanguage` | string \| null | |
| `openPullRequests` | integer | |
| `fetchedAt` | timestamp | Used to determine cache freshness against the 10–15 min TTL |
| `status` | enum: `fresh` \| `stale-fallback` \| `never-fetched` | Drives which UI state renders: live stats, last-known-good stats, or placeholder (per Edge Cases in spec.md) |

**State transitions**:

```
never-fetched --(successful fetch)--> fresh
fresh --(TTL expires, next fetch succeeds)--> fresh (refreshed)
fresh --(TTL expires, next fetch fails)--> stale-fallback
stale-fallback --(next fetch succeeds)--> fresh
stale-fallback --(next fetch fails again)--> stale-fallback (unchanged, same cached values)
```

There is no transition back to `never-fetched` once a successful fetch has
occurred — a repo with any successful fetch in its history always has last-known-good
data to fall back to.
