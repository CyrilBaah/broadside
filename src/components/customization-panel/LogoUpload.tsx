"use client";

import { Upload, X } from "lucide-react";
import { useId, useState, type ChangeEvent } from "react";
import { encodeLogoAsDataUri, validateLogoFile } from "@/lib/config/logo-upload";
import styles from "./LogoUpload.module.css";

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
  const inputId = useId();
  const errorId = useId();

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
    <div className={styles.field}>
      <span className={styles.label}>Logo</span>
      <div className={styles.row}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" width={40} height={40} className={styles.thumb} />
        ) : null}

        <label htmlFor={inputId} className={styles.dropzone}>
          <Upload size={15} strokeWidth={2} aria-hidden="true" />
          {value ? "Replace logo" : "Upload logo"}
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className={styles.input}
            aria-describedby={error ? errorId : undefined}
          />
        </label>

        {value ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={styles.remove}
            aria-label="Remove logo"
            title="Remove logo"
          >
            <X size={15} strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        <p className={styles.hint}>PNG, JPEG, WebP, or SVG · max 2MB</p>
      )}
    </div>
  );
}
