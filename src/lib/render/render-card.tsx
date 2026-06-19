import type { ReactElement } from "react";
import satori from "satori";
import { loadFonts } from "./fonts";
import { DefaultTemplate } from "./templates/default";
import { PlaceholderCard } from "./templates/placeholder";
import { CARD_HEIGHT, CARD_WIDTH, type TemplateProps } from "./types";
import type { Template } from "../config/schema";

/**
 * PRD §5: the single rendering function `(template, params, cachedRepoStats) → image`.
 * This module produces the SVG stage; src/lib/render/export-image.ts rasterizes it.
 */
export async function renderCardToSvg(props: TemplateProps): Promise<string> {
  // FR-012: never-fetched repos render a clear placeholder instead of stat badges.
  if (props.snapshot.status === "never-fetched") {
    return renderToSvg(
      <PlaceholderCard
        theme={props.config.theme}
        message="Stats aren't available yet for this repo. They'll appear once GitHub responds."
      />,
    );
  }

  const Template = templateFor(props.config.template);
  return renderToSvg(<Template {...props} />);
}

export async function renderErrorCardToSvg(message: string, theme: TemplateProps["config"]["theme"]) {
  return renderToSvg(<PlaceholderCard theme={theme} message={message} />);
}

function templateFor(template: Template) {
  switch (template) {
    case "default":
      return DefaultTemplate;
    case "minimal":
      return DefaultTemplate; // overridden once T030 (Minimal template) lands
    case "stats-forward":
      return DefaultTemplate; // overridden once T031 (Stats-forward template) lands
    default:
      return DefaultTemplate;
  }
}

async function renderToSvg(element: ReactElement): Promise<string> {
  return satori(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: loadFonts(),
  });
}
