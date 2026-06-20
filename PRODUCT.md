# Product

## Register

product

## Users

Open source maintainers and developers who want to announce or promote a GitHub repo — in a README, on social media, or in a blog post. They land on the single-page config tool, paste a repo URL, see an immediate live preview, tweak a few knobs (theme, font, pattern, layout), and leave with either a static image or a stable embeddable link. No account, no setup — the entire product is this one page plus the image-generation endpoint it talks to.

## Product Purpose

Turn any public GitHub repo into a shareable announcement card — like the old printed broadside: a single sheet posted publicly to announce news. Success is the full loop (paste → customize → export) completing fast, with a card that keeps working reliably wherever it's embedded (last-known-good stats, never a broken badge).

## Brand Personality

Confident, direct, quietly crafted. A subtle nod to the broadside/print namesake (the name and tagline carry the metaphor) without leaning into literal letterpress/poster pastiche — this is a modern dev tool first, with just enough typographic character to feel intentional rather than templated. It should read as credible enough for a serious OSS maintainer to embed in their README without a second thought.

## Anti-references

- The current unstyled UI itself: system font stack, raw GitHub blue (#0969da) and gray (#57606a), default `<select>` elements, no visual identity of its own.
- Generic AI-generated SaaS defaults: cream/sand backgrounds, gradient text, uppercase tracked eyebrows, identical icon+heading+text card grids.
- Toy/meme-generator energy: this is a tool for announcing real projects, not a novelty card maker — keep it sharp and credible, not playful or cartoonish.

## Design Principles

- **The preview is the product.** Every customization choice should feel immediate and trustworthy — the live card preview is the thing users are here for; nothing should compete with it for attention.
- **Show the failure modes, not just the happy path.** Per the reliability principle in the PRD, loading/error/placeholder states are first-class, not afterthoughts — design them with the same care as the success state.
- **Earn the print reference, don't illustrate it.** Let the broadside metaphor surface through typographic confidence (strong type, decisive contrast) rather than literal texture or ornament.
- **No login, no friction, no dead ends.** Every control should make the no-account, URL-shareable nature of the tool feel like a feature, not a missing feature.
- **Credible at a glance.** A maintainer should be willing to embed this in their README on first look — polish reads as trust here.

## Accessibility & Inclusion

WCAG AA baseline: ≥4.5:1 contrast for body text, ≥3:1 for large text, full keyboard operability for all customization controls, visible focus states, and `prefers-reduced-motion` alternatives for any transitions/animations.
