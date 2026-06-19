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
 * Tracks loading/error states explicitly (Constitution III: treat loading and
 * error states as first-class, not an afterthought) since card generation can
 * take a couple of seconds (SC-001).
 */
export function CardPreview({ config }: CardPreviewProps) {
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
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f6f8fa",
      }}
    >
      {/* Keying by src forces a remount on every config change, so each
          PreviewImage instance starts fresh in "loading" state without
          needing an effect to reset it. */}
      <PreviewImage key={src} src={src} alt={`${config.owner}/${config.repo} announcement card`} />
    </div>
  );
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  if (status === "failed") {
    return (
      <p style={{ color: "#57606a", padding: 24, textAlign: "center" }}>
        The preview couldn&apos;t load. Double-check the repo URL and try again.
      </p>
    );
  }

  return (
    <>
      {status === "loading" ? (
        <p
          role="status"
          style={{ position: "absolute", color: "#57606a", padding: 24, textAlign: "center" }}
        >
          Generating preview…
        </p>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={1200}
        height={630}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          opacity: status === "loaded" ? 1 : 0,
          transition: "opacity 150ms ease-in",
        }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
      />
    </>
  );
}
