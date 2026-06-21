"use client";

import { useId, type FormEvent } from "react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import styles from "./RepoField.module.css";

export interface RepoFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error?: string | null;
}

/**
 * Compact repo input shown atop the options panel once a card exists, so
 * switching repos doesn't require scrolling back to the hero (which is gone
 * by then — see ConfigUiPage). Submits through the same handler as the hero
 * form.
 */
export function RepoField({ value, onChange, onSubmit, error }: RepoFieldProps) {
  const id = useId();
  const errorId = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        Repository
      </label>
      <form onSubmit={onSubmit} className={styles.row} data-invalid={error ? true : undefined}>
        <GithubIcon size={15} className={styles.icon} />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="owner/repo"
          aria-label="GitHub repo URL"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={styles.input}
        />
      </form>
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
