"use client";

import { useEffect } from "react";

/**
 * Single delegated pointermove listener that feeds --mx/--my into any
 * `.spotlight-card` / `.spotlight-border` element — including ones rendered
 * by server components (job cards) that can't run hooks themselves.
 */
export function SpotlightDelegate() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".spotlight-card, .spotlight-border"
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      target.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
