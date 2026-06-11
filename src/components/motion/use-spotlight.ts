"use client";

import { useCallback } from "react";

/**
 * Feeds cursor position into the `--mx` / `--my` custom properties consumed
 * by the `.spotlight-card` / `.spotlight-border` CSS. Spread the returned
 * handler onto any element carrying those classes.
 */
export function useSpotlight() {
  return useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);
}
