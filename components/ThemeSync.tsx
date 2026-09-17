"use client";

import { useEffect } from "react";

/**
 * Keeps the site theme in step with the device's light/dark setting, and keeps
 * the favicon on the opposite side (dark site → light icon) so the tab icon
 * stays visible against the browser's own chrome.
 *
 * A theme the user picks with the toggle is stored and wins until they clear it;
 * otherwise the device setting is followed live.
 */
export default function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const stored = () => {
      try {
        const v = localStorage.getItem("vaultsmith-theme");
        return v === "dark" || v === "light" ? v : null;
      } catch {
        return null;
      }
    };

    const syncFavicon = () => {
      const isDark = root.dataset.theme === "dark";
      const href = isDark ? "/favicon-dark.png" : "/favicon-light.png";
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        document.head.appendChild(link);
      }
      if (!link.href.endsWith(href)) link.href = href;
    };

    // Device theme changed: follow it unless the user chose a theme themselves.
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (stored()) return;
      root.dataset.theme = e.matches ? "dark" : "light";
    };

    // Whatever changes the theme (this listener or the toggle), re-sync the icon.
    const observer = new MutationObserver(syncFavicon);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    if (!stored()) root.dataset.theme = media.matches ? "dark" : "light";
    syncFavicon();
    media.addEventListener("change", onSystemChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onSystemChange);
    };
  }, []);

  return null;
}
