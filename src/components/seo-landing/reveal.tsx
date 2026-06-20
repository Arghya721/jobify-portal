"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger delay in ms applied once the element scrolls into view. */
  delay?: number;
  className?: string;
}

/**
 * Lightweight scroll-reveal wrapper for the pSEO landing page.
 * Uses a single IntersectionObserver per element, disconnects after the first
 * intersection, and degrades to "shown" when IO is unavailable. Motion itself
 * lives in CSS (.reveal) and is disabled under prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}
