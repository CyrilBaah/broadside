"use client";

import { useState, type ChangeEvent } from "react";
import { encodeLogoAsDataUri, validateLogoFile } from "@/lib/config/logo-upload";

export interface LogoUploadProps {
  value: string | undefined;
  onChange: (logo: string | undefined) => void;
}

/**
 * FR-006: upload a custom logo (PNG/JPEG/WebP/SVG, max 2MB). Invalid uploads
 * are rejected with a clear error and the prior logo state is retained
 * (Edge Cases) — `onChange` is simply never called on rejection.
 */
export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateLogoFile({ type: file.type, size: file.size });
      const bytes = new Uint8Array(await file.arrayBuffer());
      onChange(encodeLogoAsDataUri(file.type, bytes));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that file as a logo.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", fontSize: 14, color: "#57606a" }}>
      <label>
        Logo
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          style={{ display: "block", marginTop: 4 }}
        />
      </label>
      {value ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          style={{ marginTop: 4, alignSelf: "flex-start", fontSize: 13 }}
        >
          Remove logo
        </button>
      ) : null}
      {error ? (
        <p role="alert" style={{ color: "#cf222e", marginTop: 4 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
