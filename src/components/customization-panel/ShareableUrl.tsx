"use client";

import { useState } from "react";

export interface ShareableUrlProps {
  url: string;
}

/**
 * FR-008/SC-005: displays the full shareable config URL so anyone opening it
 * reproduces the identical customized card, with no account involved.
 */
export function ShareableUrl({ url }: ShareableUrlProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 24 }}>
      <input
        readOnly
        value={url}
        style={{
          flex: 1,
          padding: "8px 12px",
          fontSize: 13,
          border: "1px solid #d0d7de",
          borderRadius: 6,
          color: "#57606a",
        }}
      />
      <button type="button" onClick={handleCopy} style={{ padding: "8px 12px", fontSize: 13 }}>
        {copied ? "Copied!" : "Copy shareable URL"}
      </button>
    </div>
  );
}
