<!--
Sync Impact Report
==================
Version change: TEMPLATE → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles: I. Code Quality, II. Testing Standards, III. UX Consistency,
    IV. Latest Packages, V. Context7 for Docs, VI. Reuse Over Reinvention
Removed sections: none (template placeholders filled)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review
  - .specify/templates/spec-template.md ⚠ pending manual review
  - .specify/templates/tasks-template.md ⚠ pending manual review
  - .specify/templates/commands/*.md ⚠ pending manual review
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date unknown; set to today's date as
    initial ratification since this is the first formal constitution for this project.
-->

# Broadside Constitution

## Core Principles

### I. Code Quality
Code MUST be readable and explicit, with functions scoped to a single
responsibility. All code MUST follow the project's style guide. Non-trivial
changes MUST go through peer review; direct pushes to `main` are prohibited.
Rationale: explicit, single-purpose code and mandatory review keep the
codebase maintainable as contributors and features grow, and catch defects
before they reach the main branch.

### II. Testing Standards
Every feature MUST ship with tests. Test coverage MUST prioritize critical
paths and edge cases over incidental ones. Tests MUST be deterministic,
isolated from each other, and fast to run. Flaky tests MUST be fixed or
removed immediately — they are not allowed to linger.
Rationale: a test suite that isn't trustworthy is worse than no test suite;
determinism and speed are what keep tests actually run and trusted.

### III. UX Consistency
All UI, copy, and interactions MUST follow the established design system.
Any change to user-facing behavior requires design review before merging.
Error, loading, and empty states MUST be treated as first-class design
concerns, not afterthoughts.
Rationale: consistency builds user trust, and unreviewed UX changes or
neglected edge-case states are a common source of a fragmented, low-quality
product feel.

### IV. Latest Packages
Dependencies MUST use the latest stable version unless explicitly exempted
with documented rationale. Before adding a new dependency, its maintenance
status and security posture MUST be evaluated. Lockfiles MUST pin exact
versions. Unused packages MUST be audited for and removed on a regular
basis.
Rationale: staying current avoids accumulating security debt and makes
upgrades incremental rather than a high-risk, big-bang event.

### V. Context7 for Docs
When using any library, framework, or API, the current, version-specific
documentation MUST be consulted via Context7 before writing code. Training
data MUST NOT be relied upon as the source of truth for library APIs, since
it can be outdated or wrong for the pinned version in use. APIs MUST be
verified against Context7 output before implementation.
Rationale: library APIs change between versions; verifying against live,
version-matched docs prevents subtly broken integrations built on
stale assumptions.

### VI. Reuse Over Reinvention
Custom one-off code MUST NOT be written when an existing package, sample, or
established pattern already solves the problem. The codebase and the wider
ecosystem MUST be searched first. Custom implementations are only justified
when no suitable alternative exists, and that justification MUST be
documented.
Rationale: reinventing solved problems multiplies maintenance burden and
bug surface for no benefit; reuse keeps the codebase lean and leverages
community-vetted solutions.

## Governance

This constitution supersedes all other development practices for this
project. Any plan, spec, or task that conflicts with these principles MUST
be flagged and revised before proceeding; deviations MUST be documented with
explicit rationale in the relevant artifact (plan, PR description, or ADR).

This constitution is immutable without human approval — no automated or
agent-driven process may amend it unilaterally. Amendments require an
explicit human-approved proposal, and MUST update the version per semantic
versioning: MAJOR for incompatible governance or principle removals/
redefinitions, MINOR for new principles or materially expanded guidance,
PATCH for clarifications and non-semantic wording fixes. Each amendment
updates the Last Amended date below and is recorded in a Sync Impact Report
at the top of this file.

All pull requests and reviews MUST verify compliance with these principles.
Complexity that deviates from a principle MUST be justified in the change's
description; unjustified complexity is grounds for review rejection.

**Version**: 1.0.0 | **Ratified**: 2026-06-19 | **Last Amended**: 2026-06-19
