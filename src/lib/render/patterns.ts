import type { Pattern } from "../config/schema";

/**
 * FR-005: background pattern options, implemented as satori-supported CSS
 * (repeating gradients) layered subtly behind the card content.
 */
export function backgroundImageFor(pattern: Pattern, lineColor: string): string | undefined {
  switch (pattern) {
    case "dots":
      return `repeating-radial-gradient(circle, ${lineColor} 0, ${lineColor} 2px, transparent 2px, transparent 22px)`;
    case "grid":
      return [
        `repeating-linear-gradient(0deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 28px)`,
        `repeating-linear-gradient(90deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 28px)`,
      ].join(", ");
    case "circuit":
      return [
        `repeating-linear-gradient(45deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 24px)`,
        `repeating-linear-gradient(-45deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent 24px)`,
      ].join(", ");
    case "none":
    default:
      return undefined;
  }
}
