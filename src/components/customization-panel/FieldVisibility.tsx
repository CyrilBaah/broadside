"use client";

import { FIELD_KEYS, type FieldKey } from "@/lib/config/schema";
import styles from "./FieldVisibility.module.css";

export interface FieldVisibilityProps {
  value: FieldKey[];
  onChange: (next: FieldKey[]) => void;
}

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Name",
  owner: "Owner",
  language: "Language",
  stars: "Stars",
  forks: "Forks",
  issues: "Issues",
  pullRequests: "Pull Requests",
  description: "Description",
};

/**
 * FR-005/Socialify parity: which card elements are visible. Backed by a
 * plain checkbox group (not SegmentedControl) since multiple fields can be
 * on at once.
 */
export function FieldVisibility({ value, onChange }: FieldVisibilityProps) {
  function toggle(key: FieldKey) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label} id="fields-label">
        Display fields
      </span>
      <div className={styles.grid} role="group" aria-labelledby="fields-label">
        {FIELD_KEYS.map((key) => (
          <label key={key} className={styles.option}>
            <input
              type="checkbox"
              checked={value.includes(key)}
              onChange={() => toggle(key)}
              className={styles.checkbox}
            />
            {FIELD_LABELS[key]}
          </label>
        ))}
      </div>
    </div>
  );
}
