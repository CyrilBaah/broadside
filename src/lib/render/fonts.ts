import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Font as SatoriFont } from "satori";

/**
 * Bundled font for satori to rasterize text with (research.md §2: satori needs an
 * explicit font buffer, it cannot use system/OS fonts). Vendored into
 * src/assets/fonts (sourced from @fontsource/inter, OFL-licensed) rather than read
 * from node_modules at runtime — Turbopack can't statically bundle a dynamic
 * require.resolve() into a binary asset, but a plain literal path under our own
 * source tree builds cleanly.
 *
 * Inter covers Latin scripts broadly; non-Latin scripts (CJK, Arabic) fall back to
 * satori's default glyph handling — best-effort per the 2026-06-19 clarification,
 * not full i18n shaping.
 */
let cachedFonts: SatoriFont[] | undefined;

const FONTS_DIR = join(process.cwd(), "src", "assets", "fonts");

export function loadFonts(): SatoriFont[] {
  if (cachedFonts) return cachedFonts;

  cachedFonts = [
    {
      name: "Inter",
      data: readFileSync(join(FONTS_DIR, "inter-latin-400-normal.woff")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: readFileSync(join(FONTS_DIR, "inter-latin-700-normal.woff")),
      weight: 700,
      style: "normal",
    },
  ];

  return cachedFonts;
}
