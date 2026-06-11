"use client";

import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

/** GSAP number counter — counts from 0 when scrolled into view. */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const final = `${prefix}${to.toLocaleString("en-US")}${suffix}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = final;
      return;
    }

    let killed = false;
    let ctx: { revert: () => void } | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);

        const state = { value: 0 };
        ctx = gsap.context(() => {
          gsap.to(state, {
            value: to,
            duration,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(state.value).toLocaleString("en-US")}${suffix}`;
            },
            onComplete: () => {
              el.textContent = final;
            },
          });
        }, el);
      }
    );

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, [to, suffix, prefix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
