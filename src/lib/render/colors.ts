import type { Theme } from "../config/schema";

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
  /** Stat-badge label chip background; kept separate from `text` so it stays high-contrast against `statLabelText` in both themes. */
  statLabelBg: string;
  statLabelText: string;
}

/**
 * Hue 25 is the same ink-red the tool's own UI is built on (see `--hue-ink`
 * in globals.css) — these are that same OKLCH ramp (light: --bg/--surface/
 * --ink/--ink-muted/--accent/--border; dark: their [data-theme="dark"]
 * counterparts), so a card carries a little Broadside identity instead of
 * sitting at raw GitHub-chrome gray. `accent` is the one spot in the card
 * (CardMark's logo/icon fallback) where the brand mark itself, not just a
 * tint, is allowed to show.
 *
 * Values are precomputed sRGB hex, not oklch(): resvg (the SVG rasterizer
 * export-image.ts hands satori's output to) doesn't parse CSS Color 4
 * functions and silently renders unsupported colors as black.
 */
const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    background: "#fdf9f9", // oklch(98.5% 0.004 25)
    surface: "#f7f2f1", // oklch(96.5% 0.006 25)
    text: "#1a1414", // oklch(20% 0.01 25)
    subtext: "#4e4544", // oklch(40% 0.012 25)
    accent: "#a92227", // oklch(48% 0.17 25)
    border: "#ccc1c0", // oklch(82% 0.012 25)
    statLabelBg: "#201818", // oklch(22% 0.013 25)
    statLabelText: "#fefbfa", // oklch(99% 0.004 25)
  },
  dark: {
    background: "#070403", // oklch(11% 0.01 25)
    surface: "#100909", // oklch(15% 0.012 25)
    text: "#efeae9", // oklch(94% 0.006 25)
    subtext: "#b2a8a7", // oklch(74% 0.012 25)
    accent: "#e66e68", // oklch(68% 0.15 25)
    border: "#362a29", // oklch(30% 0.018 25)
    statLabelBg: "#f4ecec", // oklch(95% 0.008 25)
    statLabelText: "#1b1413", // oklch(20% 0.012 25)
  },
  // GitHub-"dimmed"-style soft dark: less luminance range than `dark`, easier
  // on the eyes in low light without the stark near-black background.
  dimmed: {
    background: "#1a1414", // oklch(20% 0.01 25)
    surface: "#251d1c", // oklch(24% 0.012 25)
    text: "#d2cccc", // oklch(85% 0.006 25)
    subtext: "#968c8b", // oklch(65% 0.012 25)
    accent: "#d15c56", // oklch(62% 0.15 25)
    border: "#403534", // oklch(34% 0.016 25)
    statLabelBg: "#352b2a", // oklch(30% 0.014 25)
    statLabelText: "#e8e3e2", // oklch(92% 0.006 25)
  },
  // Maximizes luminance contrast (near-black/near-white, saturated accent,
  // a visibly distinct border) for WCAG AAA-range legibility.
  "high-contrast": {
    background: "#010101", // oklch(6% 0.004 25)
    surface: "#080505", // oklch(12% 0.006 25)
    text: "#fdfbfb", // oklch(99% 0.002 25)
    subtext: "#ded5d4", // oklch(88% 0.01 25)
    accent: "#df202e", // oklch(58% 0.22 25)
    border: "#7d6d6c", // oklch(55% 0.02 25)
    statLabelBg: "#fdfbfb", // oklch(99% 0.002 25)
    statLabelText: "#010101", // oklch(6% 0.004 25)
  },
};

export function colorsFor(theme: Theme): ThemeColors {
  return THEME_COLORS[theme];
}
