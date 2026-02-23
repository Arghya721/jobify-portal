"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  company: string;
  role: string;
  color: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { company: "Scale AI", role: "ML Engineer", color: "#f59e0b" },
  { company: "OpenAI", role: "Research Sci.", color: "#22c55e" },
  { company: "Airbnb", role: "Senior Backend", color: "#22c55e" },
  { company: "Netflix", role: "SRE", color: "#ef4444" },
  { company: "Vercel", role: "DX Engineer", color: "#22c55e" },
  { company: "Linear", role: "Product Designer", color: "#a855f7" },
  { company: "Stripe", role: "Fullstack Dev", color: "#ef4444" },
  { company: "Figma", role: "Staff Engineer", color: "#22c55e" },
  { company: "Notion", role: "iOS Engineer", color: "#f59e0b" },
  { company: "Supabase", role: "DevRel", color: "#22c55e" },
];

function TickerPill({ item }: { item: TickerItem }) {
  return (
    <div className="inline-flex shrink-0 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: item.color }}
      />
      <span className="font-medium text-zinc-200">{item.company}</span>
      <span className="text-zinc-500">{item.role}</span>
    </div>
  );
}

export function JobTicker() {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless infinite scroll
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let position = 0;

    const animate = () => {
      if (!paused) {
        position -= 0.5;
        const halfWidth = el.scrollWidth / 2;
        if (Math.abs(position) >= halfWidth) {
          position = 0;
        }
        el.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [paused]);

  return (
    <section className="relative border-y border-zinc-800/60 bg-zinc-950/50 py-5">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((item, i) => (
            <TickerPill key={`${item.company}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
