# Feature Specification: Repo Announcement Card Generator

**Feature Branch**: `001-repo-card-generator`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "v1 core flow from PRD-broadside.md — paste a public GitHub repo URL, get a live preview, customize it, and export either a stable live-link image or a static download."

## Clarifications

### Session 2026-06-19

- Q: How should the system handle GitHub API rate limits for anonymous, multi-tenant traffic? → A: Use a server-side GitHub token/App purely to raise the API rate limit (5,000+ req/hr). No user-facing accounts involved — a backend credential only, fully compatible with the no-login principle.
- Q: What should happen in v1 when a repo's name or description contains non-Latin characters (CJK, Arabic, etc.), given full i18n/RTL shaping is explicitly deferred post-v1? → A: Best-effort render using whatever the rendering library supports by default — no special-casing, no blocking, never a blank/broken card. Imperfect shaping for some scripts is acceptable for v1; full correctness is the post-v1 i18n work already on the roadmap.
- Q: What are the concrete size/type limits for logo uploads (spec previously said only "oversized" or "non-image" without numbers)? → A: 2MB maximum, restricted to PNG, JPEG, WebP, and SVG.
- Q: Should varying forms of the same GitHub repo URL (trailing slash, `.git` suffix, mixed case, with/without protocol) be normalized to one canonical form before use as a cache key / shareable config URL? → A: Yes — normalize to lowercase `owner/repo`, stripping protocol, trailing slash, and `.git` suffix, so equivalent URLs always map to the same cache entry and shareable config.

### Session 2026-06-20

- Q: FR-015 lets a user paste an arbitrary image URL, which the server fetches at render time. What's the validation posture for URLs targeting internal/private network addresses (SSRF risk)? → A: Block non-http(s) schemes and private/internal/loopback/link-local IP ranges before fetching, rejecting with the same clear-error contract as FR-006/FR-015.
- Q: The image endpoint is fully public and unauthenticated (no accounts, per FR-013); spec.md's Assumptions only addressed GitHub-side rate limits (FR-003a), not abuse of Broadside's own endpoint. What's the posture? → A: Apply a per-IP rate limit at the edge; a client over the limit still gets a usable (cached/placeholder) response, never a hard error, so existing embeds never break.
- Q: Spec.md had no accessibility requirement at all, even though the implemented UI already follows WCAG-style conventions (focus-visible states, aria labels). Should the spec codify a baseline? → A: Yes — add an explicit success criterion that all customization controls meet WCAG AA contrast and are fully keyboard-operable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate a card from a repo URL (Priority: P1)

A user pastes a public GitHub repository URL and immediately sees a live preview of an announcement card showing the project's name, description, and current stats, using sensible default styling.

**Why this priority**: This is the entire core loop the product exists for. Without it, there is no product — every other capability customizes or exports this base result.

**Independent Test**: Paste a valid public repo URL into the input and confirm a rendered card appears with the repo's name, description, and stats, with no further action required.

**Acceptance Scenarios**:

1. **Given** a user has not yet entered anything, **When** they paste a valid public GitHub repo URL, **Then** a live preview card renders within a few seconds showing the repo's name, description, and stats using default theme/font/pattern/template.
2. **Given** a user pastes a malformed URL or a URL that isn't a GitHub repo, **When** the input is submitted, **Then** the system shows a clear, friendly error message and does not render a broken or blank card.
3. **Given** a user pastes a URL for a private or nonexistent repository, **When** the input is submitted, **Then** the system shows a clear message explaining the repo couldn't be found or accessed (private repos are not supported in v1).

---

### User Story 2 - Customize the card's appearance (Priority: P2)

A user adjusts the theme/color, font, background pattern, layout template, logo, and description text, seeing the live preview update with each change, before exporting.

**Why this priority**: Customization is what makes the card feel like "theirs" rather than a generic badge, and is explicitly called out in the PRD as the second step of the core loop — but the product is still useful at P1 without it.

**Independent Test**: With a card already rendered from User Story 1, change each customization knob independently and confirm the preview updates to reflect it, without needing to re-enter the repo URL.

**Acceptance Scenarios**:

1. **Given** a rendered card preview, **When** the user selects a different theme, font, or background pattern, **Then** the preview updates immediately to reflect the new styling.
2. **Given** a rendered card preview, **When** the user selects a different layout template (Default, Minimal, Stats-forward), **Then** the preview updates to show the chosen template's layout.
3. **Given** a rendered card preview, **When** the user uploads a logo image, **Then** the preview updates to display the uploaded logo in place of the default repo icon.
4. **Given** a rendered card preview, **When** the user overrides the description text, **Then** the preview updates to show the custom description instead of the repo's GitHub description.
5. **Given** a customized card, **When** the user shares the resulting configuration (via its URL), **Then** another person opening that URL sees the identical customized card without signing in.
6. **Given** a rendered card preview, **When** the user pastes an image URL or a data URI into the logo field instead of uploading a file, **Then** the preview updates to show that image as the logo.
7. **Given** a rendered card preview showing an auto-detected primary language, **When** the user picks a different language icon from the language icon control, **Then** the preview updates to show the selected icon in place of the auto-detected one.
8. **Given** a rendered card preview, **When** the user toggles any of the field-visibility controls (name, owner, language, stars, forks, issues, pull requests, description) off, **Then** the preview updates immediately to omit that field, and toggling it back on restores it.

---

### User Story 3 - Export the card (Priority: P1)

A user takes their customized (or default) card and obtains either a stable embeddable live-link image or a static file download in their preferred format — including ready-to-paste snippets for dropping the live link straight into a README.

**Why this priority**: Export is the point at which the product delivers its actual value — a usable artifact the user can post or embed. Tied with Story 1 as core-loop-critical, but sequenced after it since a card must exist before it can be exported. README embedding is the single most common destination for this output, so the snippet must be copy-paste ready, not just a bare URL the user has to wrap themselves.

**Independent Test**: From a rendered preview, request a live URL and confirm it renders the same card when opened independently, and that Markdown/HTML snippets using that URL render correctly when pasted into a README; separately, request a static download and confirm a valid image file is produced.

**Acceptance Scenarios**:

1. **Given** a customized card, **When** the user requests the live URL output, **Then** the system provides a stable link that, when visited, renders the same card configuration.
2. **Given** a live URL has been generated and embedded elsewhere, **When** the underlying repo's stats change, **Then** the live URL reflects the updated stats on next reasonably-cached load without the user taking any action.
3. **Given** a customized card, **When** the user views the export options, **Then** the system offers one-click copy for: the raw live URL, a Markdown image snippet (`![alt](url)`), and an HTML `<img>` tag snippet — each ready to paste directly into a README without manual editing.
4. **Given** a customized card, **When** the user requests a static download, **Then** the system produces a PNG, JPEG, or WebP file (per user's chosen format) matching the current preview.

---

### Edge Cases

- What happens when the GitHub API is rate-limited or unreachable while generating a card for the first time (no cached stats exist yet)? → Card shows a clear placeholder state instead of blank or broken badges (per PRD §4).
- What happens when a previously successful card's live URL is reloaded but the GitHub API fetch fails on that load? → Card serves the last successfully cached stats rather than going blank or erroring (per PRD §4).
- What happens when a user uploads a file that isn't PNG/JPEG/WebP/SVG, or exceeds 2MB, as a logo? → System rejects the upload with a clear error and keeps the previous logo state (default icon or prior upload).
- What happens when the repo has no description on GitHub and the user hasn't supplied an override? → Card renders without a description line rather than showing a placeholder like "undefined" or an empty box.
- What happens when the repo name/description contains very long text? → Card layout truncates or wraps text gracefully rather than overflowing the card bounds.
- What happens when the repo name/description contains non-Latin characters (CJK, Arabic, etc.)? → System renders a best-effort result using the rendering library's default text support; imperfect shaping/RTL handling is acceptable in v1 (full correctness is deferred post-v1 per the roadmap), but the card MUST still render — never blank or broken — for this case.
- What happens when the same repo URL is requested with two different customization configs simultaneously? → Each is treated as an independent, shareable configuration; no state is shared or overwritten between them.
- What happens when a user hides every stat-type field (stars, forks, issues, pull requests) but leaves name/description visible? → Card renders without a stats row at all, never an empty/placeholder row.
- What happens when a user toggles the language field on but the repo has no detected primary language and no manual icon override is set? → The language field is omitted, consistent with the existing no-language-detected behavior, regardless of the toggle.
- What happens when a pasted logo URL or data URI is unreachable, malformed, or not a supported image type? → System rejects it with a clear error and retains the prior logo state, the same handling contract as an invalid file upload (FR-006).
- What happens when a pasted logo URL resolves to a private, internal, loopback, or link-local network address, or uses a non-http(s) scheme? → System rejects it before fetching, with the same clear error and prior-logo-retained behavior as any other invalid pasted logo value (SSRF protection, clarified 2026-06-20).
- What happens when a single client (by IP) exceeds the per-IP rate limit on the image endpoint? → System still serves a usable response (last-known-good cached stats or placeholder) rather than an error, so existing embeds elsewhere keep working (clarified 2026-06-20).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a public GitHub repository URL as input, normalize it to a canonical lowercase `owner/repo` form (stripping protocol, trailing slash, and `.git` suffix), and validate that it points to an existing, accessible public repository.
- **FR-002**: System MUST render a live preview card immediately after a valid repo URL is provided, using default styling (theme, font, background pattern, layout template).
- **FR-003**: System MUST fetch and display the repo's star count, fork count, open issue count, primary language, and open pull request count on the card.
- **FR-003a**: System MUST fetch repo stats from the GitHub API using a server-side credential (token/App) rather than unauthenticated requests, so that shared anonymous traffic across many repos does not exhaust the public unauthenticated rate limit (60 req/hr/IP). This credential is operational/backend-only and introduces no user-facing accounts or sign-in.
- **FR-004**: System MUST allow the user to choose between three layout templates: Default, Minimal, and Stats-forward.
- **FR-005**: System MUST allow the user to customize theme/color, font, and background pattern, with the preview reflecting each change immediately.
- **FR-006**: System MUST allow the user to upload a custom logo image (PNG, JPEG, WebP, or SVG; maximum 2MB) to replace the repo's default icon on the card; uploads exceeding this size or of an unsupported type MUST be rejected per FR-014-style clear error handling, retaining the prior logo state.
- **FR-007**: System MUST allow the user to override the repo's GitHub description with custom text on the card.
- **FR-008**: System MUST encode the full customization configuration (repo, theme, font, pattern, template, logo reference, description override) into a shareable URL, so the same card can be reproduced by anyone opening that URL without an account.
- **FR-009**: System MUST provide a stable live-link image output that re-renders the repo's current stats on each access, subject to caching behavior (FR-011).
- **FR-009a**: System MUST provide one-click copy snippets for the live-link output in at least three forms: the raw URL, a Markdown image snippet (`![alt](url)`), and an HTML `<img>` tag — so the link can be pasted directly into a README without manual reformatting.
- **FR-010**: System MUST provide a static download output in PNG, JPEG, or WebP format matching the current preview configuration.
- **FR-011**: System MUST cache fetched repo stats for a short duration (target: 10–15 minutes) and serve the last successfully cached value if a subsequent fetch fails, rather than showing a blank or broken card.
- **FR-012**: System MUST show a clear placeholder state (not a blank or visibly broken layout) for a repo whose stats have never been successfully fetched.
- **FR-013**: System MUST require no sign-in, account creation, or login at any point in the core flow.
- **FR-014**: System MUST reject and show a clear, friendly error for invalid, malformed, private, or nonexistent repository URLs without crashing or rendering a broken card.
- **FR-015**: System MUST allow the user to set the card's logo by pasting a direct image URL or a data URI, as an alternative to uploading a file (FR-006); invalid, unreachable, or non-image values MUST be rejected with a clear error, retaining the prior logo state. A pasted URL MUST be rejected before the server fetches it if it uses a non-http(s) scheme or resolves to a private, internal, loopback, or link-local network address (SSRF protection, clarified 2026-06-20), using the same clear-error contract.
- **FR-016**: System MUST display a visual language icon on the card for the repo's detected primary language, with a user-facing control to override which language icon is shown; if no primary language is detected and no override is set, the language field MUST be omitted rather than showing a blank or placeholder icon.
- **FR-017**: System MUST allow the user to independently show or hide each of the following card fields: name, owner, primary language, stars, forks, open issues, open pull requests, and description; the preview MUST reflect each visibility change immediately, and hiding all stat-type fields MUST remove the stats row entirely rather than leaving empty space.
- **FR-018**: System MUST apply a per-IP rate limit at the edge to the image-generation endpoint, since it is fully public and unauthenticated (FR-013); a client exceeding the limit MUST still receive a usable response (last-known-good cached stats or the existing placeholder, per FR-011/FR-012) rather than a hard error, so that embeds already placed elsewhere (e.g. in a README) never break (clarified 2026-06-20).

### Key Entities

- **Repo Card Configuration**: The full set of inputs needed to render a card — target repo (canonical lowercase `owner/repo`, normalized per FR-001), theme, font, background pattern, layout template, optional logo reference (uploaded file or directly pasted URL/data URI, per FR-015), optional language icon override, optional description override, and per-field visibility settings for name, owner, language, stars, forks, issues, pull requests, and description (FR-017). Fully represented in a shareable URL; not persisted server-side.
- **Repo Stats Snapshot**: The cached result of a GitHub API fetch for a given repo — stars, forks, open issues, primary language, open pull requests, fetch timestamp, and success/failure state. Used to serve last-known-good data when a live fetch fails.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from pasting a repo URL to seeing a usable preview in under 3 seconds under normal conditions.
- **SC-002**: A user can go from initial preview to a finished export (live link or download) in under 2 minutes, including customization.
- **SC-003**: No user-visible card, whether freshly generated or loaded from a previously shared live link, ever displays a blank or visibly broken stats badge — it is always either current data, last-known-good data, or a clear placeholder.
- **SC-004**: Zero points in the core flow (preview, customize, export) require the user to sign in, register, or provide any personal account information.
- **SC-005**: A shared card configuration URL reproduces an identical card for any visitor who opens it, with no loss of customization detail.
- **SC-006**: All customization controls (repo input, theme/font/pattern/template selectors, logo/language-icon controls, field-visibility toggles, export actions) meet WCAG AA contrast and are fully operable by keyboard alone, with visible focus states (clarified 2026-06-20).

## Assumptions

- Only public GitHub repositories are supported in v1; private repositories are explicitly out of scope and return a clear error rather than partial data.
- "Reasonable defaults" for the initial preview are: Default layout template, a standard light or dark theme (exact default left to design), system-standard font, and no background pattern.
- Logo upload is stored only as part of the shareable configuration mechanism (e.g., encoded reference or transient asset), not as a persistent user account asset, consistent with the no-accounts principle.
- The short-TTL cache (10–15 minutes per PRD §4) is acceptable staleness for stats; users embedding a live link understand stats are near-real-time, not instantaneous.
- Rate limits on the public GitHub API are handled by the caching layer described in FR-011/FR-012 and are not separately exposed to the end user as a distinct error type beyond the existing placeholder/last-known-good behavior.
- Abuse of Broadside's own public, unauthenticated image endpoint (distinct from GitHub-side limits above) is bounded by a per-IP rate limit at the edge (FR-018); exact thresholds are an implementation/ops detail, not a design-time blocker.
- All per-field visibility toggles (FR-017) default to visible (on), matching today's always-shown behavior; a shared URL with no visibility params reproduces the current default card exactly, preserving SC-005 for existing links.
- The language icon set (FR-016) covers a curated list of common languages; an unrecognized language falls back to no icon (text label only, current behavior) rather than a generic/broken icon glyph.
