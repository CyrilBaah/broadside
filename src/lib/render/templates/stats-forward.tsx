import { CardMark } from "../card-mark";
import { colorsFor } from "../colors";
import { fontFamilyFor } from "../fonts";
import { backgroundImageFor } from "../patterns";
import { StatBadges } from "../stat-badges";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";
import { hasField } from "../../config/schema";

/**
 * FR-004: Stats-forward layout — stat badges given visual priority, for
 * projects whose main pitch is traction.
 */
export function StatsForwardTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
  const fontFamily = fontFamilyFor(config.font);
  const backgroundImage = backgroundImageFor(config.pattern, colors.border);
  const meta = snapshot.meta ?? { name: `${config.owner}/${config.repo}`, description: null };
  const description = hasField(config, "description") ? config.descriptionOverride ?? meta.description : null;
  const showName = hasField(config, "name");
  const showOwner = hasField(config, "owner");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.background,
        fontFamily,
        padding: 48,
        ...(backgroundImage ? { backgroundImage } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <CardMark config={config} snapshot={snapshot} colors={colors} size={40} />
        {showName || showOwner ? (
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: colors.text }}>
            {showOwner ? <span style={{ fontWeight: 400, color: colors.subtext }}>{config.owner}/</span> : null}
            {showName ? meta.name : null}
          </div>
        ) : null}
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
          <StatBadges stats={snapshot.stats} colors={colors} fields={config.fields} emphasized />
        ) : null}
      </div>
    </div>
  );
}
