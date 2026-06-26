"use client";

import styles from "./HideGithubIconToggle.module.css";

export interface HideGithubIconToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
}

/**
 * Drops the GitHub mark from the language-icon combo so only the language
 * icon shows — useful alongside a custom logo, which renders next to it.
 */
export function HideGithubIconToggle({ value, onChange }: HideGithubIconToggleProps) {
  return (
    <div className={styles.field}>
      <label className={styles.option}>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className={styles.checkbox}
        />
        Hide GitHub icon
      </label>
    </div>
  );
}
