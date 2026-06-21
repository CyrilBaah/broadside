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

const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    background: "#ffffff",
    surface: "#f6f8fa",
    text: "#0d1117",
    subtext: "#57606a",
    accent: "#0969da",
    border: "#d0d7de",
    statLabelBg: "#1f2328",
    statLabelText: "#ffffff",
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    text: "#f0f6fc",
    subtext: "#8b949e",
    accent: "#58a6ff",
    border: "#30363d",
    statLabelBg: "#e6edf3",
    statLabelText: "#1f2328",
  },
};

export function colorsFor(theme: Theme): ThemeColors {
  return THEME_COLORS[theme];
}
