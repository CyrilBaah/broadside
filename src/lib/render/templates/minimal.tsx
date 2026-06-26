import { CardMark } from "../card-mark";
import { colorsFor } from "../colors";
import { fontFamilyFor } from "../fonts";
import { backgroundStyleFor } from "../patterns";
import { StatBadges } from "../stat-badges";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";
import { hasField } from "../../config/schema";

/**
 * FR-004: Minimal layout — logo, name, description, and (per the Display
 * fields checkboxes) stat badges. "Minimal" refers to the centered,
 * uncluttered composition, not to omitting whichever fields the user
 * explicitly turned on.
 */
export function MinimalTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
  const fontFamily = fontFamilyFor(config.font);
  const backgroundStyle = backgroundStyleFor(config.pattern, colors.border);
  const meta = snapshot.meta ?? { name: `${config.owner}/${config.repo}`, description: null };
  const description = hasField(config, "description") ? config.descriptionOverride ?? meta.description : null;
  const showName = hasField(config, "name");
  const showOwner = hasField(config, "owner");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.background,
        fontFamily,
        padding: 72,
        textAlign: "center",
        ...(backgroundStyle ?? {}),
      }}
    >
      <CardMark config={config} snapshot={snapshot} colors={colors} size={104} />
      {showName || showOwner ? (
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: colors.text, marginTop: 28 }}>
          {showOwner ? <span style={{ fontWeight: 400, color: colors.subtext }}>{config.owner}/</span> : null}
          {showName ? meta.name : null}
        </div>
      ) : null}
      {description ? (
        <div style={{ fontSize: 26, color: colors.subtext, marginTop: 16, maxWidth: 900 }}>
          {description}
        </div>
      ) : null}
      {snapshot.stats ? (
        <div style={{ display: "flex", marginTop: 36 }}>
          <StatBadges stats={snapshot.stats} colors={colors} fields={config.fields} emphasized />
        </div>
      ) : null}
    </div>
  );
}
