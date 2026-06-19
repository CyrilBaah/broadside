"use client";

import { useState } from "react";
import { buildEmbedSnippets } from "@/lib/config/embed-snippets";
import {
  IMAGE_FORMATS,
  type ImageFormat,
  type RepoCardConfig,
} from "@/lib/config/schema";
import { buildCardPath } from "@/lib/config/url-codec";

export interface ExportPanelProps {
  config: RepoCardConfig;
  baseUrl: string;
}

/**
 * FR-009a/FR-010: one-click copy for the live-link embed snippets (raw URL,
 * Markdown, HTML) plus a static download in the user's chosen format
 * (US3 Acceptance Scenarios 3-4).
 */
export function ExportPanel({ config, baseUrl }: ExportPanelProps) {
  const [format, setFormat] = useState<ImageFormat>(config.format);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const liveUrl = `${baseUrl}${buildCardPath(config, "png")}`;
  const downloadUrl = `${baseUrl}${buildCardPath({ ...config, format }, format)}`;
  const snippets = buildEmbedSnippets(liveUrl, `${config.owner}/${config.repo}`);

  async function copy(key: "url" | "markdown" | "html", value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 0 }}>Export</h2>

      <CopyRow label="Raw URL" onCopy={() => copy("url", snippets.url)} copied={copiedKey === "url"} />
      <CopyRow
        label="Markdown"
        onCopy={() => copy("markdown", snippets.markdown)}
        copied={copiedKey === "markdown"}
      />
      <CopyRow label="HTML" onCopy={() => copy("html", snippets.html)} copied={copiedKey === "html"} />

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <select value={format} onChange={(e) => setFormat(e.target.value as ImageFormat)}>
          {IMAGE_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>
        <a href={downloadUrl} download={`${config.owner}-${config.repo}.${format}`}>
          <button type="button" style={{ padding: "8px 16px" }}>
            Download {format.toUpperCase()}
          </button>
        </a>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  onCopy,
  copied,
}: {
  label: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ width: 90, fontSize: 13, color: "#57606a" }}>{label}</span>
      <button type="button" onClick={onCopy} style={{ padding: "6px 12px", fontSize: 13 }}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
