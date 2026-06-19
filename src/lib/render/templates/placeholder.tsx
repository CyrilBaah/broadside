import { colorsFor } from "../colors";
import { CARD_HEIGHT, CARD_WIDTH } from "../types";
import type { Theme } from "../../config/schema";

/**
 * FR-012: a clear placeholder card for a repo whose stats have never been
 * successfully fetched, so embeds never show a blank or broken layout.
 */
export function PlaceholderCard({
  theme,
  message,
}: {
  theme: Theme;
  message: string;
}) {
  const colors = colorsFor(theme);

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
        color: colors.subtext,
        fontFamily: "Inter",
        textAlign: "center",
        padding: 64,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
        Broadside
      </div>
      <div style={{ fontSize: 20, maxWidth: 720 }}>{message}</div>
    </div>
  );
}
