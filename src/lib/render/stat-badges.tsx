import type { ReactNode } from "react";
import type { ThemeColors } from "./colors";
import type { RepoStats } from "../github/stats";
import type { FieldKey } from "../config/schema";

export interface StatBadgesProps {
  stats: RepoStats;
  colors: ThemeColors;
  /** Which stat badges to render, per the Display fields checkboxes. */
  fields: readonly FieldKey[];
  /** Larger badges for the stats-forward template (FR-004). */
  emphasized?: boolean;
}

/** Per-metric accent, after Socialify's color-coded stat pills (aa.md reference). */
const ACCENT_COLORS = {
  stars: "#dfb317",
  forks: "#97ca00",
  issues: "#2188ff",
  pullRequests: "#fe7d37",
  language: "#8957e5",
} as const;

function Badge({
  label,
  value,
  colors,
  accent,
  emphasized,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  accent: string;
  emphasized?: boolean;
}) {
  return (
    <div style={{ display: "flex", borderRadius: emphasized ? 10 : 8, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: colors.statLabelBg,
          color: colors.statLabelText,
          fontSize: emphasized ? 18 : 13,
          fontWeight: 600,
          letterSpacing: 1,
          padding: emphasized ? "14px 20px" : "8px 14px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: accent,
          color: "#ffffff",
          fontSize: emphasized ? 20 : 15,
          fontWeight: 700,
          padding: emphasized ? "14px 20px" : "8px 14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/** FR-003: renders stars, forks, open issues, primary language, and open PRs — filtered by `fields`. */
export function StatBadges({ stats, colors, fields, emphasized }: StatBadgesProps) {
  const badges: ReactNode[] = [];
  if (fields.includes("stars")) {
    badges.push(
      <Badge
        key="stars"
        label="Stars"
        value={formatCount(stats.stars)}
        colors={colors}
        accent={ACCENT_COLORS.stars}
        emphasized={emphasized}
      />,
    );
  }
  if (fields.includes("forks")) {
    badges.push(
      <Badge
        key="forks"
        label="Forks"
        value={formatCount(stats.forks)}
        colors={colors}
        accent={ACCENT_COLORS.forks}
        emphasized={emphasized}
      />,
    );
  }
  if (fields.includes("issues")) {
    badges.push(
      <Badge
        key="issues"
        label="Issues"
        value={formatCount(stats.openIssues)}
        colors={colors}
        accent={ACCENT_COLORS.issues}
        emphasized={emphasized}
      />,
    );
  }
  if (fields.includes("pullRequests")) {
    badges.push(
      <Badge
        key="pullRequests"
        label="Pulls"
        value={formatCount(stats.openPullRequests)}
        colors={colors}
        accent={ACCENT_COLORS.pullRequests}
        emphasized={emphasized}
      />,
    );
  }
  if (fields.includes("language") && stats.primaryLanguage) {
    badges.push(
      <Badge
        key="language"
        label="Language"
        value={stats.primaryLanguage}
        colors={colors}
        accent={ACCENT_COLORS.language}
        emphasized={emphasized}
      />,
    );
  }

  if (badges.length === 0) return null;

  return <div style={{ display: "flex", gap: emphasized ? 14 : 10 }}>{badges}</div>;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
