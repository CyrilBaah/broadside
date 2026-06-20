import { CardMark } from "../card-mark";
import { colorsFor } from "../colors";
import { backgroundImageFor } from "../patterns";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";
import { hasField } from "../../config/schema";

/**
 * FR-004: Minimal layout — logo, name, one-line description only. No stat
 * badges, for projects that want a quiet card.
 */
export function MinimalTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
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
        alignItems: "center",
        justifyContent: "center",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.background,
        fontFamily: "Inter",
        padding: 72,
        textAlign: "center",
        ...(backgroundImage ? { backgroundImage } : {}),
      }}
    >
      <CardMark config={config} snapshot={snapshot} colors={colors} size={72} />
      {showName || showOwner ? (
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: colors.text, marginTop: 24 }}>
          {showOwner ? <span style={{ fontWeight: 400, color: colors.subtext }}>{config.owner}/</span> : null}
          {showName ? meta.name : null}
        </div>
      ) : null}
      {description ? (
        <div style={{ fontSize: 24, color: colors.subtext, marginTop: 12, maxWidth: 900 }}>
          {description}
        </div>
      ) : null}
    </div>
  );
}
