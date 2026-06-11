"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** seconds before the stagger starts */
  delay?: number;
  /** seconds between each word */
  stagger?: number;
  /** reveal on scroll into view instead of on mount */
  onScroll?: boolean;
  id?: string;
}

/**
 * GSAP word-mask reveal. Each word sits in an overflow-hidden span and
 * slides up from below with a slight rotation — the classic editorial
 * "curtain" entrance, no SplitText plugin needed.
 */
export function TextReveal({
  text,
  as: Tag = "div",
  className,
  delay = 0,
  stagger = 0.06,
  onScroll = false,
  id,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-reveal-word]").forEach((w) => {
        w.style.transform = "none";
        w.style.opacity = "1";
      });
      return;
    }

    let ctx: { revert: () => void } | undefined;
    let killed = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.fromTo(
            "[data-reveal-word]",
            { yPercent: 110, rotate: 4, opacity: 0 },
            {
              yPercent: 0,
              rotate: 0,
              opacity: 1,
              duration: 0.9,
              delay,
              stagger,
              ease: "power4.out",
              ...(onScroll && {
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  once: true,
                },
              }),
            }
          );
        }, el);
      }
    );

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, [delay, stagger, onScroll]);

  return (
    // @ts-expect-error — polymorphic ref
    <Tag ref={ref} id={id} className={cn(className)} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <span
            data-reveal-word
            className="inline-block will-change-transform"
            style={{ opacity: 0 }}
          >
            {word}
          </span>
          {i < text.split(" ").length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
