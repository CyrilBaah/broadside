# broadside

![cyrilbaah/broadside](https://broadside.cyrilbaah.com/cyrilbaah/broadside.png?pattern=charlie-brown&fields=stars%2Cdescription%2Clanguage%2Cname%2Cforks%2Cowner)



**Pin up your repo.** [Try it live →](https://broadside.cyrilbaah.com)

Turn any public GitHub repository into a shareable announcement card a clean,
customizable image showing the project's name, description, and live stats.
Paste a repo URL, customize it, and get either a static image to post or a
live link that always reflects the repo's current state.

The name comes from the old printed broadside: a single sheet posted publicly
to announce news. That's the product a public, single-glance announcement
for a repo.

## Why

- **No sign-in, ever.** The whole configuration lives in the URL  nothing to
  save, nothing to log into.
- **Reliable by default.** Stats are cached at the edge with a last-known-good
  fallback, so a card embedded in your README never goes blank or breaks.
- **Free and open source.** MIT licensed, no paid tier.

## Usage

1. Paste a GitHub repo URL into the [config UI](https://broadside.cyrilbaah.com).
2. Customize theme, font, background pattern, layout template, and which
   stats to show.
3. Grab one of two outputs:
   - **Live link**  a stable, embeddable URL that always reflects the repo's
     current stats.
   - **Static download**  a PNG, JPEG, or WebP for posting directly.

Embed the live link in a README like this one:

```md
[![repo-name](https://broadside.cyrilbaah.com/{owner}/{repo}.png)](https://broadside.cyrilbaah.com/{owner}/{repo})
```

## Contributing

PRs welcome see [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

## License

[MIT](LICENSE)
