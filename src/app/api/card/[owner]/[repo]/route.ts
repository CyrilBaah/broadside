import { NextRequest, NextResponse } from "next/server";
import { decodeConfig } from "@/lib/config/url-codec";
import {
  ALLOWED_LOGO_MIME_TYPES,
  IMAGE_FORMATS,
  type ImageFormat,
} from "@/lib/config/schema";
import { getRepoStatsSnapshot } from "@/lib/cache/repo-stats-cache";
import { RepoNotFoundError } from "@/lib/github/stats";
import { contentTypeFor, exportImage } from "@/lib/render/export-image";
import { renderCardToSvg, renderErrorCardToSvg } from "@/lib/render/render-card";

export const runtime = "nodejs";

/**
 * Card image Route Handler — implements contracts/card-image-endpoint.md.
 * Both the "live link" output (FR-009) and the "static download" output
 * (FR-010) are served by this same endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo: repoWithExt } = await params;
  const { repo, ext: rawExt } = splitExtension(repoWithExt);
  const ext = rawExt === "jpg" ? "jpeg" : rawExt;

  if (!isImageFormat(ext)) {
    return errorImageResponse(`"${rawExt}" isn't a supported image format. Use png, jpg, or webp.`);
  }

  const lowerOwner = owner.toLowerCase();
  const lowerRepo = repo.toLowerCase();
  const config = decodeConfig(lowerOwner, lowerRepo, request.nextUrl.searchParams);
  config.format = ext;

  if (config.logo && !isLikelyValidLogoReference(config.logo)) {
    return errorImageResponse("That logo reference isn't valid; the default icon will be used.", {
      config,
    });
  }

  try {
    const snapshot = await getRepoStatsSnapshot(lowerOwner, lowerRepo);
    const svg = await renderCardToSvg({ config, snapshot });
    const image = await exportImage(svg, ext);

    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(ext),
        // FR-009/FR-011: align the live-link cache lifetime with the stats TTL.
        "Cache-Control": "public, max-age=720, s-maxage=720, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    if (error instanceof RepoNotFoundError) {
      return errorImageResponse(error.message, { config });
    }
    return errorImageResponse(
      "Something went wrong rendering this card. Please try again shortly.",
      { config },
    );
  }
}

function splitExtension(repoWithExt: string): { repo: string; ext: string } {
  const lastDot = repoWithExt.lastIndexOf(".");
  if (lastDot === -1) return { repo: repoWithExt, ext: "" };
  return { repo: repoWithExt.slice(0, lastDot), ext: repoWithExt.slice(lastDot + 1).toLowerCase() };
}

function isImageFormat(ext: string): ext is ImageFormat {
  return (IMAGE_FORMATS as readonly string[]).includes(ext);
}

function isLikelyValidLogoReference(logo: string): boolean {
  if (logo.startsWith("data:")) {
    return ALLOWED_LOGO_MIME_TYPES.some((mime) => logo.startsWith(`data:${mime}`));
  }
  return /^https?:\/\//i.test(logo);
}

/**
 * Always responds 200, even for "errors" — browsers treat any non-2xx <img src>
 * response as a broken image regardless of body content, so a 404/500 here
 * would defeat FR-012/FR-014's "never a broken card" guarantee for the README
 * embed use case (the primary consumer of this endpoint). The image content
 * itself communicates the problem instead (PRD §4, SC-003).
 */
async function errorImageResponse(
  message: string,
  options?: { config?: { theme: "light" | "dark" } },
) {
  const theme = options?.config?.theme ?? "light";
  const svg = await renderErrorCardToSvg(message, theme);
  const image = await exportImage(svg, "png");

  return new NextResponse(new Uint8Array(image), {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}
