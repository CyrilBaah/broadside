"use client";

import type { KeyboardEvent, ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  name: string;
  label: string;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/**
 * A `role="radiogroup"` of buttons with roving tabindex — one stop in the
 * tab order, arrow keys move the selection. Replaces bare `<select>`s for
 * small, visually-meaningful option sets (theme, font, pattern, template).
 */
export function SegmentedControl<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = options.findIndex((option) => option.value === value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      onChange(options[nextIndex]!.value);
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${name}-label`}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${name}-label`}
        className={styles.group}
        onKeyDown={handleKeyDown}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={styles.segment}
              data-selected={selected || undefined}
              onClick={() => onChange(option.value)}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
