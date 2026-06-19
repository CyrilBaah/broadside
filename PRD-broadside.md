# PRD: Broadside

**Tagline:** "Pin up your repo."
**License:** Free & open source (MIT)
**Status:** Approved direction — Phase 1 (v1) scoped

---

## 1. Overview

Broadside turns any public GitHub repository into a shareable announcement image — a clean, customizable card showing the project's name, description, and live stats. Paste a repo URL, customize it, and get either a static image to post or a live link that always reflects the repo's current state.

The name comes from the old printed broadside: a single sheet posted publicly to announce news. That's the product — a public, single-glance announcement for a repo.

## 2. Principles (non-negotiable)

- **Free and open source.** No paid tier, no architecture decisions made in anticipation of monetization.
- **No sign-in, no accounts, ever.** Anonymous by design. Any feature that would normally need an account (saved settings, history) must be solved without one — a shareable config URL, a browser-local save, never a login wall.
- **Simple and easy to use.** The core loop is: paste URL → customize → get image. Every new feature is judged against whether it slows that loop down. If it does, it's secondary and opt-in, never default.
- **Reliable by default.** A card that's embedded in someone's README has to keep working. Stats must never silently break or go blank — they degrade to a last-known-good value instead.

## 3. v1 Scope

### 3.1 Core flow
1. User pastes a GitHub repo URL.
2. Live preview renders immediately with sensible defaults.
3. User customizes: theme, font, background pattern, layout template, optional logo upload, optional description override.
4. User takes one of two outputs:
   - **Live URL** — a stable link (e.g. `broadside.dev/{owner}/{repo}.png?theme=Dark&pattern=Circuit&template=Minimal`) that always renders the current state of the repo, suitable for embedding in a README.
   - **Static download** — PNG, JPEG, or WebP, suitable for posting directly to social platforms.

### 3.2 Stats shown
Stars, forks, open issues, primary language, and open pull requests — pulled from the public GitHub API and rendered into the card.

### 3.3 Layout templates
- **Default** — balanced logo/title/description + stat badges.
- **Minimal** — logo, name, one-line description only. No stat badges, for projects that want a quiet card.
- **Stats-forward** — stat badges given visual priority, for projects whose main pitch is traction.

### 3.4 Customization knobs
Theme/color, font, background pattern, logo upload, description text override — all encoded as query parameters so the whole configuration is shareable and scriptable without any backend state.

## 4. Reliability Requirement

Repo stats are fetched from the GitHub API and cached (short TTL, ~10–15 min) at the edge. If a fetch fails, the card serves the last successfully cached value rather than a blank or broken badge. If no successful fetch has ever occurred for a repo, the card shows a clear placeholder rather than a visibly broken layout. This behavior is part of the v1 spec, not a follow-up fix — a card that breaks silently when embedded elsewhere is a failure of the core product, not an edge case.

## 5. Architecture (v1)

- Single web app (Next.js) serving both the configuration UI and the image-generation endpoint.
- One rendering function: `(template, params, cachedRepoStats) → image`, producing SVG rendered to PNG/JPEG/WebP.
- One edge/in-memory cache layer for GitHub API stats, with last-known-good fallback per §4.
- No database, no authentication, no background workers, no containerization — none of these are needed to ship v1.
- Hosted on a platform with a generous free tier for edge functions/image generation.

## 6. Out of Scope for v1

These are real ideas, not rejected ideas — just not part of the first release, and each has a path back in that respects the no-login principle:

| Feature | Why not now | Path back in later |
|---|---|---|
| Self-host packaging (Docker) | Not needed to validate the hosted product first | Add once the hosted version is stable |
| Saved presets | Would normally need an account | Encode full config in a shareable URL, or save to the browser's local storage — never a server account |
| Org-wide batch generation | Needs a notion of "your org," which implies auth | Could work anonymously via a public org-name lookup + rate limiting — separate spec when prioritized |
| Multi-platform export sizes (Twitter/LinkedIn/Discord crops) | Not core to the first loop | Same renderer, additional aspect-ratio parameter — small addition later |
| Usage/impression counts on live image endpoint | Adds complexity not needed to validate core value | Possible later as an aggregate, privacy-respecting counter |
| GitLab/Bitbucket support | GitHub is the validated need | Extend once GitHub version is solid |
| Full i18n/CJK/RTL text shaping | Real but non-blocking for v1 | Pick up early in the next phase — it's a correctness issue, not a feature |

## 7. Success Criteria for v1

- Full core loop works end to end: paste URL → customize → live link or static export.
- No stat-staleness or broken-badge states reach a user — always last-known-good or a clear placeholder.
- Zero accounts, zero login prompts anywhere in the product.
- Time from landing on the page to a usable image is fast — no unnecessary steps before the first preview renders.

## 8. Roadmap (post-v1, still no-login)

1. Full i18n/CJK/RTL rendering correctness.
2. Multi-platform export sizes (additional aspect-ratio presets on the existing renderer).
3. Shareable/local-storage config save — the no-login alternative to accounts.
4. Self-host packaging (Docker) for teams that want to run their own instance.
5. Anonymous org-wide batch generation, designed to stay login-free.
