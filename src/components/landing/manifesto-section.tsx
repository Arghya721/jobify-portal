"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
    <div className="overflow-hidden border-y border-border/30 py-3.5">
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-5 px-3"
          >
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
  return (
    <section className="relative border-t border-border/60" aria-labelledby="manifesto-heading">
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

      {/* Manifesto strip — scrolls left */}
      <MarqueeStrip items={MANIFESTO} speed={38} />

      {/* Center */}
      <div className="px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2
            id="manifesto-heading"
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ lineHeight: 1.04 }}
          >
            Better jobs.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Zero noise.
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
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95"
            >
              Browse open roles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/filters"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-6 py-3 text-sm font-medium text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/12 hover:text-emerald-300 active:scale-95"
            >
              Save your search
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground"
            >
              View companies
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Tech stack strip — scrolls right */}
      <MarqueeStrip items={STACKS} reverse speed={50} />
    </section>
  );
}
