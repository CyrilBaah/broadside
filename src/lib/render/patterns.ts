import type { Pattern } from "../config/schema";

export interface PatternStyle {
  backgroundImage?: string;
  /** Tile size for the image-based patterns below; gradient patterns repeat natively and don't need it. */
  backgroundSize?: string;
}

const unhex = (lineColor: string) => lineColor.replace("#", "");

type TileSlug = Exclude<Pattern, "none" | "dots" | "grid" | "circuit">;

/** viewBox dimensions + path data lifted from heropatterns.com (MIT, via lowmess/hero-patterns). */
const TILE_PATTERNS: Record<TileSlug, { width: number; height: number; path: string }> = {
  plus: {
    width: 60,
    height: 60,
    path: "M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z",
  },
  "diagonal-stripes": {
    width: 40,
    height: 40,
    path: "M0 40L40 0H20L0 20zM40 40V20L20 40z",
  },
  "brick-wall": {
    width: 42,
    height: 44,
    path: "M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z",
  },
  signal: {
    width: 84,
    height: 48,
    path: "M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z",
  },
  "charlie-brown": {
    width: 20,
    height: 12,
    path: "M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z",
  },
  "overlapping-hexagons": {
    width: 50,
    height: 40,
    path: "M40 10L36.67 0h-2.11l3.33 10H20l-2.28 6.84L12.11 0H10l6.67 20H10l-2.28 6.84L2.11 10 5.44 0h-2.1L0 10l6.67 20-3.34 10h2.11l2.28-6.84L10 40h20l2.28-6.84L34.56 40h2.1l-3.33-10H40l2.28-6.84L47.89 40H50l-6.67-20L50 0h-2.1l-5.62 16.84L40 10zm1.23 10l-2.28-6.84L34 28h4.56l2.67-8zm-10.67 8l-2-6h-9.12l2 6h9.12zm-12.84-4.84L12.77 38h15.79l2.67-8H20l-2.28-6.84zM18.77 20H30l2.28 6.84L37.23 12H21.44l-2.67 8zm-7.33 2H16l-4.95 14.84L8.77 30l2.67-8z",
  },
};

function tilePattern(slug: TileSlug, lineColor: string): PatternStyle {
  const { width, height, path } = TILE_PATTERNS[slug];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" fill="#${unhex(lineColor)}" fill-rule="evenodd"/></svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${width}px ${height}px`,
  };
}

/**
 * FR-005: background pattern options. The original four are satori-supported
 * CSS (repeating gradients); the rest are tiled SVG icons lifted from
 * heropatterns.com, since satori also supports `background-size` +
 * `background-repeat: repeat` (its default) for `url()` images.
 */
export function backgroundStyleFor(pattern: Pattern, lineColor: string): PatternStyle | undefined {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `repeating-radial-gradient(circle, ${lineColor} 0, ${lineColor} 2px, transparent 2px, transparent 22px)`,
      };
    case "grid":
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 28px)`,
          `repeating-linear-gradient(90deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 28px)`,
        ].join(", "),
      };
    case "circuit":
      return {
        backgroundImage: [
          `repeating-linear-gradient(45deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 24px)`,
          `repeating-linear-gradient(-45deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 24px)`,
        ].join(", "),
      };
    case "plus":
    case "diagonal-stripes":
    case "brick-wall":
    case "signal":
    case "charlie-brown":
    case "overlapping-hexagons":
      return tilePattern(pattern, lineColor);
    case "none":
    default:
      return undefined;
  }
}
