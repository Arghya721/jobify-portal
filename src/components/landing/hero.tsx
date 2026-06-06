"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { DotPattern } from "@/components/ui/dot-pattern";
import { sendGAEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = [
  "Dream Opportunity.",
  "Engineering Role.",
  "Remote Position.",
  "Next Move.",
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.92], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleSearch = useCallback(() => {
    sendGAEvent("event", "hero_search", { query: searchValue.trim() || "(empty)" });
    if (searchValue.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/jobs");
    }
  }, [searchValue, router]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Dot grid */}
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(60%_50%_at_50%_40%,white,transparent)]"
        )}
      />

      {/* Parallax content wrapper */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="mx-auto max-w-screen-2xl px-4 pb-16 pt-24 text-center md:pb-24 md:pt-32"
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs tracking-wide text-emerald-400">
            Live · Direct from ATS · No recruiters · No spam
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Find your next
          <br />
          <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom" style={{ contain: "paint" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="inline-block text-emerald-400"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-lg"
        >
          <p className="text-base text-muted-foreground sm:text-lg">
            Direct from source ATS. No recruiters. No spam.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="mx-auto mt-10 max-w-xl"
        >
          <div
            role="search"
            className="relative flex items-center rounded-xl border border-border/60 bg-secondary/80 shadow-2xl shadow-black/5 transition-[border-color,box-shadow] duration-200 focus-within:border-emerald-500/40 focus-within:shadow-emerald-500/10 dark:shadow-black/40"
          >
            <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
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
              className="h-14 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-base"
            />
            <button
              onClick={handleSearch}
              aria-label="Submit job search"
              className="mr-2 rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Search
            </button>
          </div>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
          className="mt-6 font-mono text-xs tracking-wide text-muted-foreground/50"
        >
          50,000 engineers searching · 100 companies indexed · every role direct from ATS
        </motion.p>
      </motion.div>
    </section>
  );
}
