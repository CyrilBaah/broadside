"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { buildEmbedSnippets } from "@/lib/config/embed-snippets";
import { IMAGE_FORMATS, type ImageFormat, type RepoCardConfig } from "@/lib/config/schema";
import { buildCardPath } from "@/lib/config/url-codec";
import styles from "./ExportPanel.module.css";

export interface ExportPanelProps {
  config: RepoCardConfig;
  baseUrl: string;
}

const SNIPPET_LABELS = {
  url: "Raw URL",
  markdown: "Markdown",
  html: "HTML",
} as const;

/**
 * FR-009a/FR-010: one-click copy for the live-link embed snippets (raw URL,
 * Markdown, HTML) plus a static download in the user's chosen format
 * (US3 Acceptance Scenarios 3-4).
 */
export function ExportPanel({ config, baseUrl }: ExportPanelProps) {
  const [format, setFormat] = useState<ImageFormat>(config.format);
  const [copiedKey, setCopiedKey] = useState<keyof typeof SNIPPET_LABELS | null>(null);

  const liveUrl = `${baseUrl}${buildCardPath(config, "png")}`;
  const downloadUrl = `${baseUrl}${buildCardPath({ ...config, format }, format)}`;
  const snippets = buildEmbedSnippets(liveUrl, `${config.owner}/${config.repo}`);

  async function copy(key: keyof typeof SNIPPET_LABELS, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>Export</h2>

      <div className={styles.snippets}>
        {(Object.keys(SNIPPET_LABELS) as Array<keyof typeof SNIPPET_LABELS>).map((key) => (
          <CopyRow
            key={key}
            label={SNIPPET_LABELS[key]}
            value={snippets[key]}
            onCopy={() => copy(key, snippets[key])}
            copied={copiedKey === key}
          />
        ))}
      </div>

      <div className={styles.download}>
        <SegmentedControl
          name="format"
          label="Format"
          value={format}
          onChange={setFormat}
          options={IMAGE_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
        />
        <a
          href={downloadUrl}
          download={`${config.owner}-${config.repo}.${format}`}
          className={styles.downloadButton}
        >
          <Download size={15} strokeWidth={2} aria-hidden="true" />
          Download {format.toUpperCase()}
        </a>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <code className={styles.rowValue}>{value}</code>
      <button type="button" onClick={onCopy} className={styles.copyButton} data-copied={copied || undefined}>
        {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
