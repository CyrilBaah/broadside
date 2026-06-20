#!/usr/bin/env node
/**
 * Regenerates src/lib/icons/language-icons.ts from the `simple-icons` package.
 * We bake the curated subset in as static data rather than depending on
 * simple-icons at runtime, since it ships the full ~3500-icon catalog and
 * would otherwise bloat both the client bundle and the satori render tree.
 *
 * Usage: node scripts/extract-language-icons.mjs > src/lib/icons/language-icons.ts
 * Add new entries to LANGUAGE_TO_SLUG below, then re-run.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../node_modules/simple-icons", import.meta.url));

/** Maps a GitHub Linguist `language` string to a simple-icons slug. */
const LANGUAGE_TO_SLUG = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Go: "go",
  Rust: "rust",
  Java: "openjdk",
  C: "c",
  "C++": "cplusplus",
  Ruby: "ruby",
  PHP: "php",
  Swift: "swift",
  Kotlin: "kotlin",
  Dart: "dart",
  HTML: "html5",
  CSS: "css",
  Shell: "gnubash",
  Scala: "scala",
  Elixir: "elixir",
  Haskell: "haskell",
  Lua: "lua",
  Perl: "perl",
  R: "r",
  Clojure: "clojure",
  "Vim Script": "vim",
  "Jupyter Notebook": "jupyter",
  Vue: "vuedotjs",
  Svelte: "svelte",
  Crystal: "crystal",
  Elm: "elm",
  "F#": "fsharp",
  Groovy: "apachegroovy",
  Solidity: "solidity",
  Zig: "zig",
  Nim: "nim",
  OCaml: "ocaml",
  Erlang: "erlang",
  Julia: "julia",
  WebAssembly: "webassembly",
  Dockerfile: "docker",
  CMake: "cmake",
};

const data = JSON.parse(readFileSync(`${ROOT}/data/simple-icons.json`, "utf8"));
const bySlug = new Map(data.map((icon) => [icon.slug, icon]));

function pathFor(slug) {
  const svg = readFileSync(`${ROOT}/icons/${slug}.svg`, "utf8");
  const match = /<path d="([^"]+)"/.exec(svg);
  if (!match) throw new Error(`no path found for ${slug}`);
  return match[1];
}

const entries = Object.entries(LANGUAGE_TO_SLUG).map(([language, slug]) => {
  const icon = bySlug.get(slug);
  if (!icon) throw new Error(`unknown simple-icons slug: ${slug}`);
  return { language, slug, title: icon.title, hex: icon.hex, path: pathFor(slug) };
});

const lines = entries.map(
  (e) =>
    `  { language: ${JSON.stringify(e.language)}, slug: ${JSON.stringify(e.slug)}, title: ${JSON.stringify(e.title)}, hex: ${JSON.stringify(e.hex)}, path: ${JSON.stringify(e.path)} },`,
);

const githubMarkPath = pathFor("github");

console.log(`/**
 * Curated subset of simple-icons (https://simpleicons.org), baked in as static
 * path data at build time rather than imported at runtime — avoids pulling the
 * full ~3500-icon package into the client bundle or the satori render tree.
 * Re-run scripts/extract-language-icons.mjs to add more.
 */

export interface LanguageIcon {
  /** GitHub Linguist language name, e.g. the repo stats' primaryLanguage. */
  language: string;
  /** simple-icons slug, used as the stable key for this icon. */
  slug: string;
  /** Brand display name (may differ slightly from the language name). */
  title: string;
  /** Brand hex color, without a leading #. */
  hex: string;
  /** SVG path data, viewBox 0 0 24 24. */
  path: string;
}

export const LANGUAGE_ICONS: readonly LanguageIcon[] = [
${lines.join("\n")}
];

export const LANGUAGE_ICONS_BY_SLUG: ReadonlyMap<string, LanguageIcon> = new Map(
  LANGUAGE_ICONS.map((icon) => [icon.slug, icon]),
);

/** Best-effort match from a GitHub Linguist language name to a curated icon. */
export function languageIconFor(language: string | null | undefined): LanguageIcon | undefined {
  if (!language) return undefined;
  return LANGUAGE_ICONS.find((icon) => icon.language.toLowerCase() === language.toLowerCase());
}

/** The GitHub mark, paired with the selected language icon in the combo lockup. */
export const GITHUB_MARK_PATH =
  ${JSON.stringify(githubMarkPath)};
`);
