import type { ThemeColors } from "./colors";
import type { RepoStats } from "../github/stats";

export interface StatBadgesProps {
  stats: RepoStats;
  colors: ThemeColors;
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

/** FR-003: renders stars, forks, open issues, primary language, and open PRs. */
export function StatBadges({ stats, colors, emphasized }: StatBadgesProps) {
  return (
    <div style={{ display: "flex", gap: emphasized ? 20 : 12 }}>
      <Badge label="Stars" value={formatCount(stats.stars)} colors={colors} emphasized={emphasized} />
      <Badge label="Forks" value={formatCount(stats.forks)} colors={colors} emphasized={emphasized} />
      <Badge
        label="Issues"
        value={formatCount(stats.openIssues)}
        colors={colors}
        emphasized={emphasized}
      />
      <Badge label="PRs" value={formatCount(stats.openPullRequests)} colors={colors} emphasized={emphasized} />
      {stats.primaryLanguage ? (
        <Badge label="Language" value={stats.primaryLanguage} colors={colors} emphasized={emphasized} />
      ) : null}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
