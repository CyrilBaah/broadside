"use client";

import type { ReactNode } from "react";
import {
  PATTERNS,
  TEMPLATES,
  THEMES,
  type Pattern,
  type RepoCardConfig,
  type Template,
  type Theme,
} from "@/lib/config/schema";

export interface CustomizationPanelProps {
  config: RepoCardConfig;
  onChange: (next: RepoCardConfig) => void;
}

const FONT_OPTIONS = ["system", "mono", "serif"];

/**
 * FR-005: theme/font/pattern/template customization, updating the preview
 * immediately on each change (US2 Acceptance Scenarios 1-2).
 */
export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
  function update<K extends keyof RepoCardConfig>(key: K, value: RepoCardConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
      <Field label="Theme">
        <select value={config.theme} onChange={(e) => update("theme", e.target.value as Theme)}>
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Font">
        <select value={config.font} onChange={(e) => update("font", e.target.value)}>
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Pattern">
        <select value={config.pattern} onChange={(e) => update("pattern", e.target.value as Pattern)}>
          {PATTERNS.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Template">
        <select
          value={config.template}
          onChange={(e) => update("template", e.target.value as Template)}
        >
          {TEMPLATES.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", fontSize: 14, color: "#57606a" }}>
      {label}
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}
