"use client";

import { Select } from "@/components/ui/Select";
import {
  PATTERNS,
  THEMES,
  type Pattern,
  type RepoCardConfig,
  type Theme,
} from "@/lib/config/schema";
import styles from "./CustomizationPanel.module.css";

export interface CustomizationPanelProps {
  config: RepoCardConfig;
  onChange: (next: RepoCardConfig) => void;
}

const FONT_OPTIONS = [
  { value: "system", label: "System" },
  { value: "mono", label: "Mono" },
  { value: "serif", label: "Serif" },
] as const;

const PATTERN_LABELS: Record<Pattern, string> = {
  none: "None",
  dots: "Dots",
  grid: "Grid",
  circuit: "Circuit",
  plus: "Plus",
  "diagonal-stripes": "Diagonal stripes",
  "brick-wall": "Brick wall",
  signal: "Signal",
  "charlie-brown": "Charlie Brown",
  "overlapping-hexagons": "Overlapping hexagons",
};

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  dimmed: "Dimmed",
  "high-contrast": "High contrast",
};

/**
 * FR-005: theme/font/pattern customization, updating the preview immediately
 * on each change (US2 Acceptance Scenarios 1-2). These control the rendered
 * card's own look, distinct from the tool's page-level ThemeToggle in the
 * header. Template is fixed to "minimal" (DEFAULT_TEMPLATE) — not exposed
 * as a control.
 */
export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
  function update<K extends keyof RepoCardConfig>(key: K, value: RepoCardConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className={styles.panel}>
      <Select
        label="Theme"
        value={config.theme}
        onChange={(value: Theme) => update("theme", value)}
        options={THEMES.map((theme) => ({ value: theme, label: THEME_LABELS[theme] }))}
      />

      <Select
        label="Font"
        value={config.font}
        onChange={(value: string) => update("font", value)}
        options={FONT_OPTIONS}
      />

      <Select
        label="Pattern"
        value={config.pattern}
        onChange={(value: Pattern) => update("pattern", value)}
        options={PATTERNS.map((pattern) => ({ value: pattern, label: PATTERN_LABELS[pattern] }))}
      />
    </div>
  );
}
