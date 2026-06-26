"use client";

import { Ban, ChevronDown, Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type ChangeEvent } from "react";
import { LanguageIconGlyph } from "@/lib/icons/LanguageIconGlyph";
import { LANGUAGE_ICONS, LANGUAGE_ICONS_BY_SLUG, NO_LANGUAGE_ICON } from "@/lib/icons/language-icons";
import styles from "./LanguageIconPicker.module.css";

export interface LanguageIconPickerProps {
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
}

/**
 * Curated language-icon combo mark (GitHub octocat + a brand icon), matching
 * the reference tool's "Language Icon" dropdown. Can render alongside a
 * custom logo upload; see HideGithubIconToggle to drop the octocat from it.
 * Selecting "None" sets the `NO_LANGUAGE_ICON` sentinel so no language icon
 * renders at all, as opposed to "Auto-detect" which falls back to the repo's
 * primary language.
 */
export function LanguageIconPicker({ value, onChange }: LanguageIconPickerProps) {
  const [query, setQuery] = useState("");
  const popoverId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const isNone = value === NO_LANGUAGE_ICON;
  const selected = value && !isNone ? LANGUAGE_ICONS_BY_SLUG.get(value) : undefined;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGE_ICONS;
    return LANGUAGE_ICONS.filter(
      (icon) => icon.language.toLowerCase().includes(q) || icon.title.toLowerCase().includes(q),
    );
  }, [query]);

  function select(slug: string | undefined) {
    onChange(slug);
    setQuery("");
    (document.getElementById(popoverId) as HTMLDivElement | null)?.hidePopover?.();
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>Language icon</span>

      <button
        type="button"
        popoverTarget={popoverId}
        className={styles.trigger}
        onClick={() => requestAnimationFrame(() => inputRef.current?.focus())}
      >
        {selected ? (
          <LanguageIconGlyph path={selected.path} size={18} color={`#${selected.hex}`} />
        ) : isNone ? (
          <Ban size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <span className={styles.triggerPlaceholderIcon} aria-hidden="true" />
        )}
        <span className={styles.triggerLabel}>
          {selected ? selected.title : isNone ? "None" : "Auto-detect"}
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      <div id={popoverId} popover="auto" className={styles.popover}>
        <div className={styles.search}>
          <Search size={14} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search languages…"
            aria-label="Search language icons"
            className={styles.searchInput}
          />
        </div>

        <ul className={styles.list} role="listbox" aria-label="Language icon">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={styles.option}
              onClick={() => select(undefined)}
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
              <span>Auto-detect from repo language</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={isNone}
              className={styles.option}
              data-selected={isNone || undefined}
              onClick={() => select(NO_LANGUAGE_ICON)}
            >
              <Ban size={16} strokeWidth={2} aria-hidden="true" />
              <span>None</span>
            </button>
          </li>
          {results.map((icon) => (
            <li key={icon.slug}>
              <button
                type="button"
                role="option"
                aria-selected={icon.slug === value}
                className={styles.option}
                data-selected={icon.slug === value || undefined}
                onClick={() => select(icon.slug)}
              >
                <LanguageIconGlyph path={icon.path} size={16} color={`#${icon.hex}`} />
                <span>{icon.title}</span>
              </button>
            </li>
          ))}
          {results.length === 0 ? <li className={styles.empty}>No matching languages</li> : null}
        </ul>
      </div>
    </div>
  );
}
