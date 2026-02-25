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
    <div className="inline-flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-secondary/80 px-4 py-2.5 text-sm">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: item.color }}
      />
      <span className="font-medium text-foreground">{item.company}</span>
      <span className="text-muted-foreground">{item.role}</span>
    </div>
  );
}

export function JobTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  // Duplicate items for seamless infinite scroll
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;

    const animate = () => {
      if (!isPausedRef.current) {
        positionRef.current -= 0.5;
        const halfWidth = el.scrollWidth / 2;
        if (Math.abs(positionRef.current) >= halfWidth) {
          positionRef.current = 0;
        }
        el.style.transform = `translateX(${positionRef.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="relative border-y border-border/60 bg-background py-5">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div
        className="overflow-hidden"
        onMouseEnter={() => (isPausedRef.current = true)}
        onMouseLeave={() => (isPausedRef.current = false)}
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
