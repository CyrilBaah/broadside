"use client";

import { Grid2x2, Hash, MoonStar, SunMedium, Waves, X } from "lucide-react";
import type { ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  PATTERNS,
  TEMPLATES,
  THEMES,
  type Pattern,
  type RepoCardConfig,
  type Template,
  type Theme,
} from "@/lib/config/schema";
import styles from "./CustomizationPanel.module.css";

export interface CustomizationPanelProps {
  config: RepoCardConfig;
  onChange: (next: RepoCardConfig) => void;
}

const FONT_OPTIONS = ["system", "mono", "serif"] as const;

const PATTERN_ICONS: Record<Pattern, ReactNode> = {
  none: <X size={14} strokeWidth={2} />,
  dots: <Hash size={14} strokeWidth={2} />,
  grid: <Grid2x2 size={14} strokeWidth={2} />,
  circuit: <Waves size={14} strokeWidth={2} />,
};

/**
 * FR-005: theme/font/pattern/template customization, updating the preview
 * immediately on each change (US2 Acceptance Scenarios 1-2). These control
 * the rendered card's own look, distinct from the tool's page-level
 * ThemeToggle in the header.
 */
export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
  function update<K extends keyof RepoCardConfig>(key: K, value: RepoCardConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <SegmentedControl
          name="theme"
          label="Theme"
          value={config.theme}
          onChange={(value: Theme) => update("theme", value)}
          options={THEMES.map((theme) => ({
            value: theme,
            label: theme === "light" ? "Light" : "Dark",
            icon: theme === "light" ? <SunMedium size={14} /> : <MoonStar size={14} />,
          }))}
        />

        <SegmentedControl
          name="font"
          label="Font"
          value={config.font}
          onChange={(value: string) => update("font", value)}
          options={FONT_OPTIONS.map((font) => ({ value: font, label: font }))}
        />

        <SegmentedControl
          name="pattern"
          label="Pattern"
          value={config.pattern}
          onChange={(value: Pattern) => update("pattern", value)}
          options={PATTERNS.map((pattern) => ({
            value: pattern,
            label: pattern === "none" ? "None" : pattern[0]!.toUpperCase() + pattern.slice(1),
            icon: PATTERN_ICONS[pattern],
          }))}
        />

        <SegmentedControl
          name="template"
          label="Template"
          value={config.template}
          onChange={(value: Template) => update("template", value)}
          options={TEMPLATES.map((template) => ({
            value: template,
            label:
              template === "stats-forward"
                ? "Stats-forward"
                : template[0]!.toUpperCase() + template.slice(1),
          }))}
        />
      </div>
    </div>
  );
}
