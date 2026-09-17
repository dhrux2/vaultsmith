"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(
      current === "dark" || current === "light"
        ? current
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem("vaultsmith-theme", next);
      } catch {
        /* storage unavailable, theme still applies for this visit */
      }
      setTheme(next);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };

    if (reduce) {
      apply();
    } else if (doc.startViewTransition) {
      // Cross-fade the whole page as one snapshot so nothing changes out of sync.
      doc.startViewTransition(apply);
    } else {
      // Fallback: hide the background circles, switch, then fade them back in.
      root.classList.add("theme-switching");
      window.setTimeout(() => {
        apply();
        window.setTimeout(() => root.classList.remove("theme-switching"), 60);
      }, 220);
    }
  };

  return (
    <motion.button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme ?? "none"}
          className="icon-wrap"
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.22 }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
