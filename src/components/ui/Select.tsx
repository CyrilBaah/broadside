"use client";

import { Check, ChevronDown } from "lucide-react";
import { useId } from "react";
import styles from "./Select.module.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label: string;
  options: ReadonlyArray<SelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/**
 * A click-to-open dropdown list (native Popover API, same anchor-positioning
 * pattern as LanguageIconPicker) for option sets better read as a list than
 * a row of segments — e.g. Font, where labels are font-family previews.
 */
export function Select<T extends string>({ label, options, value, onChange }: SelectProps<T>) {
  const popoverId = useId();
  const selected = options.find((option) => option.value === value);

  function select(next: T) {
    onChange(next);
    (document.getElementById(popoverId) as HTMLDivElement | null)?.hidePopover?.();
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>

      <button type="button" popoverTarget={popoverId} className={styles.trigger}>
        <span className={styles.triggerLabel}>{selected?.label ?? value}</span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      <div id={popoverId} popover="auto" className={styles.popover}>
        <ul className={styles.list} role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={styles.option}
                data-selected={option.value === value || undefined}
                onClick={() => select(option.value)}
              >
                <span>{option.label}</span>
                {option.value === value ? (
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
