"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const MANIFESTO = [
  "NO RECRUITERS",
  "DIRECT FROM ATS",
  "NO SPAM",
  "ZERO MIDDLEMEN",
  "REAL JOBS ONLY",
  "FRESHLY INDEXED",
  "NO DUPLICATES",
  "ENGINEERS FIRST",
  "NO GATEKEEPERS",
  "JUST SIGNAL",
];

const STACKS = [
  "TYPESCRIPT",
  "PYTHON",
  "GO",
  "RUST",
  "REACT",
  "KUBERNETES",
  "AWS",
  "ELIXIR",
  "NODE.JS",
  "TERRAFORM",
  "POSTGRES",
  "PYTORCH",
];

function MarqueeStrip({
  items,
  reverse = false,
  speed = 40,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3.5">
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex shrink-0 items-center gap-5 px-3">
            <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.22em] text-muted-foreground/40">
              {item}
            </span>
            <span className="text-[10px] text-muted-foreground/20">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ManifestoSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let killed = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);

        const words = headingRef.current?.querySelectorAll<HTMLElement>(".gsap-word");
        if (!words?.length) return;

        gsap.fromTo(
          words,
          { opacity: 0.1, willChange: "opacity" },
          {
            opacity: 1,
            stagger: 0.07,
            ease: "none",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              end: "bottom 35%",
              scrub: 1,
            },
          }
        );
      }
    );

    return () => {
      killed = true;
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    };
  }, []);

  return (
    <section className="relative" aria-labelledby="manifesto-heading">
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <MarqueeStrip items={MANIFESTO} speed={38} />

      <div className="px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-6 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
            The Jobify way
          </p>

          {/* GSAP word-scrub headline */}
          <h2
            id="manifesto-heading"
            ref={headingRef}
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
            style={{ lineHeight: 1.04 }}
          >
            {"Better jobs.".split(" ").map((word, i) => (
              <span key={`a-${i}`} className="gsap-word inline-block" style={{ marginRight: "0.25em" }}>
                {word}
              </span>
            ))}
            <br />
            <span className="text-emerald-400">
              {"Zero noise.".split(" ").map((word, i) => (
                <span key={`b-${i}`} className="gsap-word inline-block" style={{ marginRight: i === 0 ? "0.25em" : 0 }}>
                  {word}
                </span>
              ))}
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-xs text-sm text-muted-foreground sm:max-w-sm sm:text-base"
          >
            Every role pulled directly from company ATS. No middlemen, no
            duplicates — just the jobs that matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.32, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Browse open roles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/filters"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-6 py-3 text-sm font-medium text-emerald-400 transition-[transform,border-color,background-color,color] duration-150 hover:border-emerald-500/50 hover:bg-emerald-500/12 hover:text-emerald-300 active:scale-[0.97]"
            >
              Save your search
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-[transform,border-color,color] duration-150 hover:border-border hover:text-foreground active:scale-[0.97]"
            >
              View companies
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <MarqueeStrip items={STACKS} reverse speed={50} />
    </section>
  );
}
