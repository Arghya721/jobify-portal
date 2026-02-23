"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const ROTATING_WORDS = [
  "Dream Opportunity.",
  "Engineering Role.",
  "Remote Position.",
  "Next Challenge.",
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

  // Rotate headline words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotate placeholders
  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleSearch = useCallback(() => {
    if (searchValue.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/jobs");
    }
  }, [searchValue, router]);

  return (
    <section className="relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.4 0 0) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Radial fade mask */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, transparent 20%, oklch(0.145 0 0) 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Find your next
          <br />
          <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="inline-block bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-lg"
        >
          <p className="text-base text-zinc-400 sm:text-lg">
            Direct from source ATS. No recruiters. No spam.
          </p>
          <p className="mt-1 text-sm text-zinc-500 sm:text-base">
            Join 50,000+ engineers finding their next home.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="mx-auto mt-10 max-w-xl"
        >
          <div className="relative flex items-center rounded-xl border border-zinc-700/60 bg-zinc-900/80 shadow-2xl shadow-black/40 transition-all focus-within:border-zinc-600 focus-within:shadow-emerald-500/5">
            <Search className="ml-4 h-5 w-5 shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="h-14 flex-1 bg-transparent px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:text-base"
            />
            <button
              onClick={handleSearch}
              className="mr-2 rounded-lg bg-zinc-50 px-5 py-2 text-sm font-semibold text-zinc-900 transition-all hover:bg-white active:scale-95"
            >
              Search
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
