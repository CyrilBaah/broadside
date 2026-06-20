"use client";

import { useId } from "react";
import styles from "./DescriptionOverride.module.css";

export interface DescriptionOverrideProps {
  value: string;
  onChange: (value: string) => void;
}

/** FR-007: lets the user override the repo's GitHub description on the card. */
export function DescriptionOverride({ value, onChange }: DescriptionOverrideProps) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        Description override
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave blank to use the repo's GitHub description"
        rows={2}
        className={styles.textarea}
      />
    </div>
  );
}
