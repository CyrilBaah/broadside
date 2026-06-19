import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import type { ImageFormat } from "../config/schema";

/**
 * FR-010: rasterize an SVG card to PNG, JPEG, or WebP. Uses resvg for accurate
 * SVG → PNG rasterization, then sharp to re-encode to JPEG/WebP when requested
 * (research.md §2: reuse established libraries rather than hand-rolling either step).
 */
export async function exportImage(svg: string, format: ImageFormat): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "original" },
  });
  const pngBuffer = Buffer.from(resvg.render().asPng());

  switch (format) {
    case "png":
      return pngBuffer;
    case "jpeg":
      return sharp(pngBuffer).jpeg({ quality: 90 }).toBuffer();
    case "webp":
      return sharp(pngBuffer).webp({ quality: 90 }).toBuffer();
    default:
      return pngBuffer;
  }
}

export function contentTypeFor(format: ImageFormat): string {
  switch (format) {
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}
