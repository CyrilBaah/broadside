import { colorsFor } from "../colors";
import { backgroundImageFor } from "../patterns";
import { StatBadges } from "../stat-badges";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";

/**
 * FR-004: Stats-forward layout — stat badges given visual priority, for
 * projects whose main pitch is traction.
 */
export function StatsForwardTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
  const backgroundImage = backgroundImageFor(config.pattern, colors.border);
  const meta = snapshot.meta ?? { name: `${config.owner}/${config.repo}`, description: null };
  const description = config.descriptionOverride ?? meta.description;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.background,
        fontFamily: "Inter",
        padding: 48,
        ...(backgroundImage ? { backgroundImage } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {config.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logo} width={40} height={40} style={{ borderRadius: 10 }} alt="" />
        ) : (
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: colors.accent,
            }}
          />
        )}
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{meta.name}</div>
      </div>

      {description ? (
        <div style={{ fontSize: 18, color: colors.subtext, marginTop: 8, maxWidth: 900 }}>
          {description}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        {snapshot.stats ? (
          <StatBadges stats={snapshot.stats} colors={colors} emphasized />
        ) : null}
      </div>
    </div>
  );
}
