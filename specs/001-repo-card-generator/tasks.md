---

description: "Task list for Repo Announcement Card Generator implementation"
---

# Tasks: Repo Announcement Card Generator

**Input**: Design documents from `/specs/001-repo-card-generator/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/card-image-endpoint.md](./contracts/card-image-endpoint.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Constitution II (Testing Standards) requires every feature to ship with tests, so test tasks are part of each user story phase, not optional here.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact, per the structure in [plan.md](./plan.md)

## Path Conventions

Single Next.js project per plan.md: `src/app/`, `src/components/`, `src/lib/`, `tests/{unit,integration,e2e}/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Next.js (App Router, TypeScript) project structure per plan.md: `src/app/`, `src/components/`, `src/lib/`, `tests/{unit,integration,e2e}/`
- [X] T002 Initialize `package.json` with the latest stable Next.js, React, and TypeScript versions (Constitution IV); confirm current APIs via Context7 before scaffolding (Constitution V)
- [X] T003 [P] Configure linting and formatting (ESLint + Prettier) per Constitution I
- [X] T004 [P] Configure Vitest for unit/integration tests in `vitest.config.ts`
- [X] T005 [P] Configure Playwright for e2e tests in `playwright.config.ts`
- [X] T006 [P] Add the GitHub server-side credential as a documented environment variable in `.env.local.example` (FR-003a) — required even for local dev per quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Define the Repo Card Configuration type/schema in `src/lib/config/schema.ts` (data-model.md): normalized owner/repo, theme, font, pattern, template, logo, descriptionOverride, format
- [ ] T008 [P] Implement repo URL parsing & canonicalization in `src/lib/config/parse-repo-url.ts` — normalize to lowercase `owner/repo`, stripping protocol, trailing slash, and `.git` suffix (FR-001)
- [ ] T009 [P] Implement config encode/decode to/from URL query parameters in `src/lib/config/url-codec.ts` (FR-008, contracts/card-image-endpoint.md)
- [ ] T010 Implement an Octokit-based GitHub client authenticated with the server-side credential from T006 in `src/lib/github/client.ts` (FR-003a, research.md §3)
- [ ] T011 Implement the Repo Stats Snapshot fetcher (stars, forks, open issues, primary language, open PRs) in `src/lib/github/stats.ts` (FR-003, data-model.md), built on T010
- [ ] T012 Implement a short-TTL (10–15 min) cache with last-known-good fallback and never-fetched placeholder state in `src/lib/cache/repo-stats-cache.ts` (FR-011, FR-012, data-model.md state transitions), wrapping T011
- [ ] T013 Implement the base card rendering function `(template, params, cachedStats) → SVG` in `src/lib/render/render-card.ts` (PRD §5 architecture, research.md §2)
- [ ] T014 [P] Implement the SVG → PNG/JPEG/WebP raster export step in `src/lib/render/export-image.ts` (FR-010), consuming T013's output
- [ ] T015 Implement the Default layout template in `src/lib/render/templates/default.ts` (FR-004), consumed by T013
- [ ] T016 Create the card image Route Handler skeleton in `src/app/api/card/[owner]/[repo]/route.ts`, wiring T008, T009, T012, T013, and T015 together per contracts/card-image-endpoint.md

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Generate a card from a repo URL (Priority: P1) 🎯 MVP

**Goal**: A user pastes a public GitHub repo URL and immediately sees a live preview card with name, description, and stats, using sensible defaults.

**Independent Test**: Paste a valid public repo URL and confirm a rendered card appears with the repo's name, description, and stats, with no further action required.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [ ] T017 [P] [US1] Unit test for repo URL normalization in `tests/unit/parse-repo-url.test.ts` (FR-001)
- [ ] T018 [P] [US1] Unit test for cache fallback state transitions in `tests/unit/repo-stats-cache.test.ts` (FR-011, FR-012)
- [ ] T019 [P] [US1] Integration test for default card render end-to-end (valid repo → preview) in `tests/integration/default-card-render.test.ts` (FR-002, FR-003, SC-001)
- [ ] T020 [US1] E2E test for the core preview flow in `tests/e2e/core-preview.spec.ts` (paste URL → preview renders)

### Implementation for User Story 1

- [ ] T021 [US1] Build the repo URL input UI in `src/app/(config-ui)/page.tsx`, using T008 for client-side validation
- [ ] T022 [US1] Build the card preview component in `src/components/card-preview/CardPreview.tsx`, rendering the route handler's image (T016)
- [ ] T023 [US1] Implement invalid/malformed/private/nonexistent URL error handling and friendly error UI in `src/app/(config-ui)/page.tsx` and `src/lib/config/parse-repo-url.ts` (FR-014)
- [ ] T024 [US1] Implement the never-fetched placeholder rendering path in `src/lib/render/templates/placeholder.ts`, wired into T013/T016 (FR-012)
- [ ] T025 [US1] Wire the default preview load (default theme/font/pattern/template) end-to-end from input through T016 (FR-002, SC-001)

**Checkpoint**: User Story 1 is fully functional and testable independently — this is the MVP.

---

## Phase 4: User Story 2 - Customize the card's appearance (Priority: P2)

**Goal**: A user adjusts theme, font, pattern, layout template, logo, and description, seeing the preview update live, before exporting.

**Independent Test**: With a card already rendered, change each customization knob independently and confirm the preview updates, without re-entering the repo URL.

### Tests for User Story 2 ⚠️

- [ ] T026 [P] [US2] Unit test for config URL encode/decode round-trip in `tests/unit/url-codec.test.ts` (FR-008, SC-005)
- [ ] T027 [P] [US2] Unit test for logo upload validation (size/type limits) in `tests/unit/logo-validation.test.ts` (FR-006)
- [ ] T028 [P] [US2] Integration test for the customization round-trip (change knobs → shareable URL reproduces card) in `tests/integration/customization-roundtrip.test.ts` (SC-005)
- [ ] T029 [US2] E2E test for the full customization flow in `tests/e2e/customize-card.spec.ts` (US2 acceptance scenarios)

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implement the Minimal layout template in `src/lib/render/templates/minimal.ts` (FR-004)
- [ ] T031 [P] [US2] Implement the Stats-forward layout template in `src/lib/render/templates/stats-forward.ts` (FR-004)
- [ ] T032 [US2] Build the customization panel UI (theme/font/pattern/template selectors) in `src/components/customization-panel/CustomizationPanel.tsx` (FR-005), updating T009's config state
- [ ] T033 [US2] Implement logo upload handling with size/type validation in `src/lib/config/logo-upload.ts` and wire into the customization panel (FR-006)
- [ ] T034 [US2] Implement the description override input in `src/components/customization-panel/DescriptionOverride.tsx` (FR-007)
- [ ] T035 [US2] Wire customization panel changes to the live preview (T022) and to the shareable config URL (T009) (US2 Acceptance Scenarios 1-4)
- [ ] T036 [US2] Implement shareable URL generation/display for the current configuration in `src/app/(config-ui)/page.tsx` (FR-008, SC-005)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Export the card (Priority: P1)

**Goal**: A user obtains a stable embeddable live-link image (with copy-paste embed snippets) or a static file download.

**Independent Test**: From a rendered preview, request a live URL and confirm it renders independently; confirm Markdown/HTML snippets render correctly when pasted into a README; separately, confirm a static download produces a valid image file.

### Tests for User Story 3 ⚠️

- [ ] T037 [P] [US3] Unit test for copy-snippet generation (raw URL/Markdown/HTML) in `tests/unit/embed-snippets.test.ts` (FR-009a)
- [ ] T038 [P] [US3] Integration test for live URL re-render reflecting stat changes within the cache TTL in `tests/integration/live-url-refresh.test.ts` (FR-009)
- [ ] T039 [US3] E2E test for the export flow (live link + snippets + static download) in `tests/e2e/export-card.spec.ts` (US3 acceptance scenarios)

### Implementation for User Story 3

- [ ] T040 [US3] Implement format-specific static download response handling (png/jpeg/webp) in `src/app/api/card/[owner]/[repo]/route.ts` (FR-010), extending T016/T014
- [ ] T041 [US3] Implement cache-control headers aligned with the stats TTL on the route handler in `src/app/api/card/[owner]/[repo]/route.ts` (FR-009, FR-011)
- [ ] T042 [P] [US3] Implement embed snippet generation (raw URL, Markdown image, HTML img tag) in `src/lib/config/embed-snippets.ts` (FR-009a, contracts/card-image-endpoint.md §Copy-paste embed snippets)
- [ ] T043 [US3] Build the export panel UI with one-click copy buttons and a download action in `src/components/customization-panel/ExportPanel.tsx` (FR-009a, FR-010), using T042

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Run all quickstart.md validation scenarios manually end-to-end
- [ ] T045 [P] Pass over error/loading/empty state styling across the UI per Constitution III (UX Consistency)
- [ ] T046 Audit `src/lib/github/client.ts` and route handler responses to confirm the GitHub token is never logged or exposed client-side (FR-003a)
- [ ] T047 [P] Pin exact dependency versions in the lockfile and run a dependency/security audit per Constitution IV
- [ ] T048 Confirm non-Latin text (CJK/Arabic) renders without breaking output across all three templates (Edge Cases)
- [ ] T049 Code cleanup pass; remove dead code and unnecessary comments per Constitution I

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only — no dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational; reuses US1's preview component (T022) and route handler (T016) but is independently testable on top of them
- **User Story 3 (Phase 5)**: Depends on Foundational; reuses US1's route handler (T016) and rendering pipeline (T013/T014) but is independently testable
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Foundational config/render pieces (Phase 2) before any story-specific UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- T008, T009, T014 (Phase 2, different files) can run in parallel after T007
- All [P] tests within a story phase can run in parallel
- T030 and T031 (different template files) can run in parallel
- US2 and US3 implementation can proceed in parallel by different developers once US1 (and thus Foundational) is done, since they touch different files except the shared route handler (T016/T040/T041 — sequence these if the same person isn't doing both)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for repo URL normalization in tests/unit/parse-repo-url.test.ts"
Task: "Unit test for cache fallback state transitions in tests/unit/repo-stats-cache.test.ts"
Task: "Integration test for default card render in tests/integration/default-card-render.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md scenario 1 (core loop, preview half) independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (also P1) → Test independently → Deploy/Demo (full core loop: preview + export)
4. Add User Story 2 → Test independently → Deploy/Demo (adds customization on top of the working core loop)

Note: US1 and US3 are both P1 and together form the minimal usable product (paste → preview → export); US2 (customization) is valuable but the product already delivers core value without it.

### Parallel Team Strategy

With multiple developers, once Foundational is done:
- Developer A: User Story 1
- Developer B: User Story 3 (after US1's route handler skeleton exists from Foundational)
- Developer C: User Story 2

Coordinate on `src/app/api/card/[owner]/[repo]/route.ts` since US1 (T016), US3 (T040, T041) all touch it.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
