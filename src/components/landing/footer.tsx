"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SEO_NAV_LINKS } from "@/config/seo-pages";

const WORDMARK = "JOBIFY";

interface FooterLinkItem {
  href: string;
  label: string;
}

function FooterColumn({ title, links }: { title: string; links: FooterLinkItem[] }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="group relative inline-block transition-colors hover:text-foreground">
              {label}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-0 bg-emerald-400 transition-all duration-300 ease-out group-hover:w-full"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
      {/* Top — brand + link columns */}
      <div className="mx-auto max-w-screen-2xl px-4 pt-14 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BrandLogo className="h-7 w-7" />
              Jobify
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/80">
              Live engineering jobs pulled straight from company ATS platforms — no aggregator delays, no duplicate listings.
            </p>
          </div>

          <FooterColumn
            title="Browse"
            links={[
              { href: "/jobs", label: "All jobs" },
              { href: "/companies", label: "Companies" },
            ]}
          />

          <FooterColumn title="Jobs by stack" links={SEO_NAV_LINKS} />

          <FooterColumn
            title="Legal"
            links={[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/cookies", label: "Cookies" },
            ]}
          />
        </div>

        <div className="mt-12 border-t border-border/30 pt-6">
          <span className="text-xs text-muted-foreground/70">
            © 2026 Jobify Inc. Built for builders.
          </span>
        </div>
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
