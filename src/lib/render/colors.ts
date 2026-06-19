import type { Theme } from "../config/schema";

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
}

const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    background: "#ffffff",
    surface: "#f6f8fa",
    text: "#0d1117",
    subtext: "#57606a",
    accent: "#0969da",
    border: "#d0d7de",
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    text: "#f0f6fc",
    subtext: "#8b949e",
    accent: "#58a6ff",
    border: "#30363d",
  },
};

export function colorsFor(theme: Theme): ThemeColors {
  return THEME_COLORS[theme];
}
