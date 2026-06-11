"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";

const WORDMARK = "JOBIFY";

export function Footer() {
  const markRef = useRef<HTMLDivElement>(null);

  // Letters fill from outline → solid as the footer scrolls into view
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markRef.current
        ?.querySelectorAll<HTMLElement>("[data-mark-letter]")
        .forEach((l) => l.classList.add("is-filled"));
      return;
    }

    let killed = false;
    let ctx: { revert: () => void } | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed || !markRef.current) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.fromTo(
            "[data-mark-letter]",
            { yPercent: 35, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.06,
              duration: 0.9,
              ease: "power4.out",
              scrollTrigger: {
                trigger: markRef.current,
                start: "top 92%",
                once: true,
              },
            }
          );
        }, markRef);
      }
    );

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, []);

  return (
    <footer className="relative overflow-hidden border-t border-border/30">
      {/* Top row — brand + links */}
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 px-4 pt-14 sm:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BrandLogo className="h-7 w-7" />
          Jobify
        </Link>

        <div className="flex gap-7 text-sm text-muted-foreground">
          {[
            { href: "/jobs", label: "Jobs" },
            { href: "/companies", label: "Companies" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/cookies", label: "Cookies" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative transition-colors hover:text-foreground"
            >
              {label}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-0 bg-emerald-400 transition-all duration-300 ease-out group-hover:w-full"
              />
            </Link>
          ))}
        </div>

        <span className="text-xs text-muted-foreground/70">
          © 2026 Jobify Inc. Built for builders.
        </span>
      </div>

      {/* Giant editorial wordmark — outlined, fills on hover per-letter */}
      <div
        ref={markRef}
        aria-hidden="true"
        className="pointer-events-auto mx-auto mt-10 flex max-w-screen-2xl select-none justify-center overflow-hidden px-4 pb-2"
      >
        {WORDMARK.split("").map((letter, i) => (
          <span
            key={i}
            data-mark-letter
            className="text-stroke text-stroke-fill inline-block font-sans text-[clamp(4rem,16.5vw,15rem)] font-bold leading-[0.85] tracking-[-0.04em] will-change-transform"
            style={{ opacity: 0 }}
          >
            {letter}
          </span>
        ))}
      </div>
    </footer>
  );
}
