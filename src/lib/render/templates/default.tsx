import { colorsFor } from "../colors";
import { backgroundImageFor } from "../patterns";
import { StatBadges } from "../stat-badges";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";

/**
 * FR-004: Default layout — balanced logo/title/description + stat badges.
 * Best-effort rendering of repo name/description regardless of script
 * (CJK, Arabic, etc.) per the 2026-06-19 clarification — no script-specific
 * handling, the font/satori pipeline renders whatever it can.
 */
export function DefaultTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
  const backgroundImage = backgroundImageFor(config.pattern, colors.border);
  const meta = snapshot.meta ?? { name: `${config.owner}/${config.repo}`, description: null };
  const description = config.descriptionOverride ?? meta.description;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.background,
        fontFamily: "Inter",
        padding: 56,
        // satori's CSS parser expects a string when this key is present at
        // all, so it's spread in conditionally rather than set to undefined.
        ...(backgroundImage ? { backgroundImage } : {}),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {config.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logo}
              width={56}
              height={56}
              style={{ borderRadius: 12 }}
              alt=""
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: colors.accent,
              }}
            />
          )}
          <div style={{ fontSize: 40, fontWeight: 700, color: colors.text }}>
            {meta.name}
          </div>
        </div>
        {description ? (
          <div style={{ fontSize: 22, color: colors.subtext, marginTop: 20, maxWidth: 880 }}>
            {description}
          </div>
        ) : null}
      </div>

      {snapshot.stats ? (
        <StatBadges stats={snapshot.stats} colors={colors} />
      ) : null}
    </div>
  );
}
