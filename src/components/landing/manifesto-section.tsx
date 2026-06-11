"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Magnetic } from "@/components/motion/magnetic";

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

  // Scroll-scrubbed word fill: ghost grey → full color as you read
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let killed = false;
    let ctx: { revert: () => void } | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed || !headingRef.current) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.fromTo(
            ".gsap-word",
            { opacity: 0.08, y: 14, filter: "blur(3px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 80%",
                end: "bottom 40%",
                scrub: 1,
              },
            }
          );
        }, headingRef);
      }
    );

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="relative" aria-labelledby="manifesto-heading">
      <MarqueeStrip items={MANIFESTO} speed={38} />

      <div className="px-4 py-28 text-center md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "120px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-8 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
            The Jobify way
          </p>

          {/* GSAP word-scrub headline */}
          <h2
            id="manifesto-heading"
            ref={headingRef}
            className="text-[clamp(3rem,8vw,6.5rem)] font-bold tracking-[-0.03em] text-foreground"
            style={{ lineHeight: 1.02 }}
          >
            {"Better jobs.".split(" ").map((word, i) => (
              <span key={`a-${i}`} className="gsap-word inline-block" style={{ marginRight: "0.22em" }}>
                {word}
              </span>
            ))}
            <br />
            <span className="font-display italic font-normal text-emerald-400">
              {"Zero noise.".split(" ").map((word, i) => (
                <span key={`b-${i}`} className="gsap-word inline-block" style={{ marginRight: i === 0 ? "0.22em" : 0 }}>
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
            className="mx-auto mt-8 max-w-xs text-sm text-muted-foreground sm:max-w-sm sm:text-base"
          >
            Every role pulled directly from company ATS. No middlemen, no
            duplicates — just the jobs that matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.32, ease: "easeOut" }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Magnetic strength={0.2}>
              <Link
                href="/jobs"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Browse open roles
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Link
                href="/filters"
                className="group inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-7 py-3.5 text-sm font-medium text-emerald-400 transition-[transform,border-color,background-color,color] duration-150 hover:border-emerald-500/50 hover:bg-emerald-500/12 hover:text-emerald-300 active:scale-[0.97]"
              >
                Save your search
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 rounded-full border border-border/50 px-7 py-3.5 text-sm font-medium text-muted-foreground transition-[transform,border-color,color] duration-150 hover:border-border hover:text-foreground active:scale-[0.97]"
              >
                View companies
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>

      <MarqueeStrip items={STACKS} reverse speed={50} />
    </section>
  );
}
