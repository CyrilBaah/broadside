import { LanguageIconGlyph } from "../icons/LanguageIconGlyph";
import { GITHUB_MARK_PATH, LANGUAGE_ICONS_BY_SLUG, languageIconFor } from "../icons/language-icons";
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
 * The card's leading mark: a custom-uploaded logo takes priority; otherwise
 * a GitHub-mark + language-icon combo (explicit `languageIcon`, or
 * auto-detected from the repo's primary language) like the reference tool's
 * "GitHub + JS" lockup; otherwise a plain accent-colored placeholder block.
 */
export function CardMark({ config, snapshot, colors, size }: CardMarkProps) {
  if (config.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={config.logo} width={size} height={size} style={{ borderRadius: size * 0.21 }} alt="" />
    );
  }

  const icon = config.languageIcon
    ? LANGUAGE_ICONS_BY_SLUG.get(config.languageIcon)
    : languageIconFor(snapshot.stats?.primaryLanguage ?? null);

  if (icon) {
    // Slightly larger than the logo/placeholder cases below: two glyphs side
    // by side read smaller than a single filled box at the same bounding
    // size, so the combo needs a bump to feel equally prominent.
    const glyphSize = Math.round(size * 0.95);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.16 }}>
        <LanguageIconGlyph path={GITHUB_MARK_PATH} size={glyphSize} color={colors.text} />
        <span style={{ fontSize: size * 0.55, fontWeight: 300, color: colors.subtext }}>+</span>
        <LanguageIconGlyph path={icon.path} size={glyphSize} color={`#${icon.hex}`} />
      </div>
    );
  }

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
