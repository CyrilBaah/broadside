"use client";

import { useState } from "react";
import type { RepoCardConfig } from "@/lib/config/schema";
import { buildCardPath } from "@/lib/config/url-codec";

export interface CardPreviewProps {
  config: RepoCardConfig;
}

/**
 * FR-002: renders the live preview by pointing an <img> at the same card
 * image endpoint used for the live-link/export outputs (contracts/card-image-endpoint.md)
 * — there's only one rendering path, so the preview always matches what gets shared.
 */
export function CardPreview({ config }: CardPreviewProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = buildCardPath(config, "png");

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1200,
        aspectRatio: "1200 / 630",
        border: "1px solid #d0d7de",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f6f8fa",
      }}
    >
      {loadFailed ? (
        <p style={{ color: "#57606a", padding: 24, textAlign: "center" }}>
          The preview couldn&apos;t load. Double-check the repo URL and try again.
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`${config.owner}/${config.repo} announcement card`}
          width={1200}
          height={630}
          style={{ width: "100%", height: "auto", display: "block" }}
          onError={() => setLoadFailed(true)}
        />
      )}
    </div>
  );
}
