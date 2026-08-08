"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

/**
 * Light is the CSS default (bare :root — see globals.css), so the only case
 * this needs to correct for is a returning visitor who previously chose
 * dark. Initial state assumes light to match SSR output; the effect below
 * reconciles it against whatever the no-flash inline script (app/layout.tsx)
 * already applied to <html> before hydration — a one-tick icon correction
 * at most, never a flash of the wrong background.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline-variant text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-on-surface"
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
