"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { HeroCanvas } from "@/components/motion/hero-canvas";
import { Magnetic } from "@/components/motion/magnetic";
import { CountUp } from "@/components/motion/count-up";

const ROTATING_WORDS = [
  "dream role",
  "remote gig",
  "next move",
  "staff seat",
  "fresh start",
];

const PLACEHOLDERS = [
  "Senior React Developer, Remote, $200k...",
  "Staff Engineer in London...",
  "Remote Go Jobs, $180k+...",
  "Frontend Lead, Series A Startup...",
  "ML Engineer, PyTorch, Remote...",
];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // GSAP intro — staggered line masks on the headline
  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-hero-line]").forEach((line) => {
        line.style.transform = "none";
        line.style.opacity = "1";
      });
      return;
    }

    let killed = false;
    let ctx: { revert: () => void } | undefined;

    import("gsap").then(({ gsap }) => {
      if (killed || !headlineRef.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-hero-line]",
          { yPercent: 105, rotate: 2.5, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.12,
            ease: "power4.out",
            delay: 0.15,
          }
        );
      }, el);
    });

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  // "/" focuses the search — power-user affordance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = useCallback(() => {
    sendGAEvent("event", "hero_search", { query: searchValue.trim() || "(empty)" });
    if (searchValue.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/jobs");
    }
  }, [searchValue, router]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92dvh] flex-col overflow-hidden"
    >
      {/* Interactive constellation field */}
      <motion.div
        style={{ opacity: canvasOpacity }}
        className="absolute inset-0 [mask-image:radial-gradient(75%_65%_at_50%_42%,white,transparent)]"
        aria-hidden="true"
      >
        <HeroCanvas />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative mx-auto flex w-full max-w-screen-2xl flex-1 flex-col items-center justify-center px-4 pb-28 pt-20 text-center md:pt-24"
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs tracking-wide text-emerald-400">
            Live · Direct from ATS · No recruiters · No spam
          </span>
        </motion.div>

        {/* Headline — GSAP line-mask reveal, serif italic accent */}
        <h1
          ref={headlineRef}
          className="text-[clamp(2.75rem,8.5vw,7rem)] font-bold leading-[0.98] tracking-[-0.03em] text-foreground"
        >
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span data-hero-line className="block will-change-transform" style={{ opacity: 0 }}>
              Your{" "}
              <span className="relative inline-block align-baseline">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: "-60%", opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    className="inline-block whitespace-nowrap font-display italic font-normal tracking-[-0.01em] text-emerald-400"
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.12em] -mb-[0.04em]">
            <span data-hero-line className="block will-change-transform" style={{ opacity: 0 }}>
              is already posted.
            </span>
          </span>
        </h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-md text-base text-muted-foreground sm:text-lg"
        >
          Every role indexed straight from company ATS —{" "}
          <span className="font-display italic text-foreground/80">before it hits the boards.</span>
        </motion.p>

        {/* Search bar — conic glow ring + magnetic submit */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto mt-12 w-full max-w-xl"
        >
          <div
            role="search"
            className="glow-ring relative flex items-center rounded-2xl border border-border/60 bg-card/70 shadow-2xl shadow-black/5 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 focus-within:border-emerald-500/40 focus-within:shadow-emerald-500/10 dark:shadow-black/40"
          >
            <Search className="ml-5 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              aria-label="Search engineering jobs"
              className="h-16 min-w-0 flex-1 bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
            />
            <kbd
              aria-hidden="true"
              className="mr-3 hidden rounded-md border border-border/70 bg-secondary/60 px-2 py-1 font-mono text-[11px] text-muted-foreground/70 sm:block"
            >
              /
            </kbd>
            <Magnetic strength={0.25} className="mr-2.5 shrink-0">
              <button
                onClick={handleSearch}
                aria-label="Submit job search"
                className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] sm:px-6"
              >
                Search
              </button>
            </Magnetic>
          </div>
        </motion.div>

        {/* Stats — live counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {[
            { value: 50000, suffix: "+", label: "engineers searching" },
            { value: 100, suffix: "+", label: "companies indexed" },
            { value: 0, suffix: "", label: "recruiters allowed", static: true },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                {stat.static ? (
                  "0"
                ) : (
                  <CountUp to={stat.value} suffix={stat.suffix} />
                )}
              </span>
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground/60 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 [@media(min-height:760px)]:flex"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground/50 uppercase">
          Scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-border/40">
          <span className="scroll-cue-line block h-full w-full bg-emerald-400/70" />
        </span>
        <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
}
