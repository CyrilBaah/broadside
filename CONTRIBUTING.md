# Contributing

Thanks for wanting to improve broadside.

## Getting started

```bash
npm install
cp .env.local.example .env.local  # add a GITHUB_TOKEN
npm run dev
```

## Before opening a PR

- `npm run lint` — ESLint must pass
- `npm run format` — Prettier formatting
- `npm run test:unit` — unit tests (Vitest)
- `npm run test:e2e` — end-to-end tests (Playwright)

## What's welcome

- Bug fixes
- New background patterns or layout templates
- Additional query parameters (open an issue first to align on the API shape)
- Docs and typo fixes

## What to avoid

- Breaking the URL-only config contract — no user accounts, no server-side state
- Adding dependencies without discussion

## Opening the PR

Keep the title short and the description focused on *why*, not *what*. Link any
related issue. Squash fixup commits before marking ready for review.
