import type { ReactNode } from "react";
import { LanguageIconGlyph } from "../icons/LanguageIconGlyph";
import {
  GITHUB_MARK_PATH,
  LANGUAGE_ICONS_BY_SLUG,
  NO_LANGUAGE_ICON,
  languageIconFor,
} from "../icons/language-icons";
import type { ThemeColors } from "./colors";
import type { RepoCardConfig } from "../config/schema";
import type { RepoStatsSnapshot } from "../cache/repo-stats-cache";

export interface CardMarkProps {
  config: RepoCardConfig;
  snapshot: RepoStatsSnapshot;
  colors: ThemeColors;
  /** Box size in px the mark should roughly fill (logo/placeholder are exactly this size). */
  size: number;
}

/**
 * The card's leading mark: a custom-uploaded logo, a GitHub-mark +
 * language-icon combo (explicit `languageIcon`, or auto-detected from the
 * repo's primary language), or both side by side — `hideGithubIcon` drops
 * the GitHub mark from the combo so just the language icon shows (alone, or
 * next to a custom logo). Falls back to a plain accent-colored placeholder
 * block when nothing is set.
 */
export function CardMark({ config, snapshot, colors, size }: CardMarkProps) {
  const glyphSize = Math.round(size * 0.95);
  const separator = (
    <span style={{ fontSize: size * 0.55, fontWeight: 300, color: colors.subtext }}>+</span>
  );

  const marks: ReactNode[] = [];

  if (config.logo) {
    marks.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img key="logo" src={config.logo} width={size} height={size} style={{ borderRadius: size * 0.21 }} alt="" />,
    );
  }

  const icon =
    config.languageIcon === NO_LANGUAGE_ICON
      ? undefined
      : config.languageIcon
        ? LANGUAGE_ICONS_BY_SLUG.get(config.languageIcon)
        : languageIconFor(snapshot.stats?.primaryLanguage ?? null);

  if (icon) {
    marks.push(
      <div key="combo" style={{ display: "flex", alignItems: "center", gap: size * 0.16 }}>
        {config.hideGithubIcon ? null : (
          <>
            <LanguageIconGlyph path={GITHUB_MARK_PATH} size={glyphSize} color={colors.text} />
            {separator}
          </>
        )}
        <LanguageIconGlyph path={icon.path} size={glyphSize} color={`#${icon.hex}`} />
      </div>,
    );
  }

  if (marks.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          width: size,
          height: size,
          borderRadius: size * 0.21,
          backgroundColor: colors.accent,
        }}
      />
    );
  }

  if (marks.length === 1) return marks[0];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.16 }}>
      {marks[0]}
      {separator}
      {marks[1]}
    </div>
  );
}
