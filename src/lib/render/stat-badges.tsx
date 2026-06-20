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

function Badge({
  label,
  value,
  colors,
  emphasized,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  emphasized?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: emphasized ? "20px 28px" : "12px 18px",
        minWidth: emphasized ? 140 : 100,
      }}
    >
      <div
        style={{
          fontSize: emphasized ? 36 : 22,
          fontWeight: 700,
          color: colors.text,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: emphasized ? 16 : 13, color: colors.subtext }}>{label}</div>
    </div>
  );
}

/** FR-003: renders stars, forks, open issues, primary language, and open PRs — filtered by `fields`. */
export function StatBadges({ stats, colors, fields, emphasized }: StatBadgesProps) {
  const badges: ReactNode[] = [];
  if (fields.includes("stars")) {
    badges.push(
      <Badge key="stars" label="Stars" value={formatCount(stats.stars)} colors={colors} emphasized={emphasized} />,
    );
  }
  if (fields.includes("forks")) {
    badges.push(
      <Badge key="forks" label="Forks" value={formatCount(stats.forks)} colors={colors} emphasized={emphasized} />,
    );
  }
  if (fields.includes("issues")) {
    badges.push(
      <Badge
        key="issues"
        label="Issues"
        value={formatCount(stats.openIssues)}
        colors={colors}
        emphasized={emphasized}
      />,
    );
  }
  if (fields.includes("pullRequests")) {
    badges.push(
      <Badge
        key="pullRequests"
        label="PRs"
        value={formatCount(stats.openPullRequests)}
        colors={colors}
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
        emphasized={emphasized}
      />,
    );
  }

  if (badges.length === 0) return null;

  return <div style={{ display: "flex", gap: emphasized ? 20 : 12 }}>{badges}</div>;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
