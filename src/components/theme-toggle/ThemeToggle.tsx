"use client";

import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

/**
 * Toggles the *tool's own* light/dark chrome — independent of the card's
 * `theme` config option (CustomizationPanel). The visible icon is driven
 * entirely by CSS against `html[data-theme]` (set pre-paint by the inline
 * script in layout.tsx), so no client state or effect is needed just to
 * render the right icon — this button only ever flips the attribute.
 */
export function ThemeToggle() {
  function toggle() {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    window.localStorage.setItem("broadside-theme", next);
  }

  return (
    <button type="button" onClick={toggle} className={styles.toggle} aria-label="Toggle color theme">
      <span className={styles.iconStack} aria-hidden="true">
        <Sun className={styles.sun} size={17} strokeWidth={2} />
        <Moon className={styles.moon} size={17} strokeWidth={2} />
      </span>
    </button>
  );
}
