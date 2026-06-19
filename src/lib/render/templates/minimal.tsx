import { colorsFor } from "../colors";
import { backgroundImageFor } from "../patterns";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "../types";

/**
 * FR-004: Minimal layout — logo, name, one-line description only. No stat
 * badges, for projects that want a quiet card.
 */
export function MinimalTemplate({ config, snapshot }: TemplateProps) {
  const colors = colorsFor(config.theme);
  const backgroundImage = backgroundImageFor(config.pattern, colors.border);
  const meta = snapshot.meta ?? { name: `${config.owner}/${config.repo}`, description: null };
  const description = config.descriptionOverride ?? meta.description;

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
      {config.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logo} width={72} height={72} style={{ borderRadius: 16 }} alt="" />
      ) : (
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundColor: colors.accent,
          }}
        />
      )}
      <div style={{ fontSize: 44, fontWeight: 700, color: colors.text, marginTop: 24 }}>
        {meta.name}
      </div>
      {description ? (
        <div style={{ fontSize: 24, color: colors.subtext, marginTop: 12, maxWidth: 900 }}>
          {description}
        </div>
      ) : null}
    </div>
  );
}
