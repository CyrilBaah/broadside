"use client";

import { ImageOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RepoCardConfig } from "@/lib/config/schema";
import { buildCardPath } from "@/lib/config/url-codec";
import styles from "./CardPreview.module.css";

export interface CardPreviewProps {
  config: RepoCardConfig;
}

/**
 * FR-002: renders the live preview by pointing an <img> at the same card
 * image endpoint used for the live-link/export outputs (contracts/card-image-endpoint.md)
 * — there's only one rendering path, so the preview always matches what gets shared.
 *
 * Preloads the next image in the background and only swaps the visible <img>
 * once it's ready, so toggling a control re-renders the card without
 * blanking the frame to a spinner every time — the previous card stays put
 * until the new one is actually available to replace it.
 */
export function CardPreview({ config }: CardPreviewProps) {
  const src = buildCardPath(config, "png");
  const alt = `${config.owner}/${config.repo} announcement card`;

  // Tracked by src rather than a "status" enum set imperatively in the
  // effect, so loading/failed/loaded are derived from state instead of
  // requiring a synchronous setState at the top of the effect body.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const preload = new window.Image();
    preload.src = src;
    preload.onload = () => {
      if (!cancelled) setLoadedSrc(src);
    };
    preload.onerror = () => {
      if (!cancelled) setFailedSrc(src);
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  const isCurrent = loadedSrc === src;
  const isFailed = failedSrc === src && !isCurrent;
  const isLoading = !isCurrent && !isFailed;

  return (
    <div className={styles.frame}>
      {isFailed && !loadedSrc ? (
        <div className={styles.message} role="alert">
          <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
          <p>The preview couldn&apos;t load. Double-check the repo URL and try again.</p>
        </div>
      ) : null}

      {isLoading && !loadedSrc ? (
        <div className={styles.message} role="status">
          <Loader2 size={24} strokeWidth={2} className={styles.spinner} aria-hidden="true" />
          <p>Generating preview…</p>
        </div>
      ) : null}

      {loadedSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={loadedSrc} alt={alt} width={1200} height={630} className={styles.image} data-loaded />
          {isLoading ? (
            <div className={styles.updating} role="status" aria-label="Updating preview">
              <Loader2 size={16} strokeWidth={2} className={styles.spinner} aria-hidden="true" />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
