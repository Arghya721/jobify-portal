"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchCompanies } from "@/app/actions/companies";

interface TickerItem {
  id: number;
  company: string;
  color: string;
}

const COLORS = [
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#a855f7",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function TickerPill({ item }: { item: TickerItem }) {
  return (
    <Link
      href={`/jobs?company_id=${item.id}`}
      className="inline-flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-secondary/80 px-4 py-2.5 text-sm transition-colors hover:border-border hover:bg-secondary"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: item.color }}
      />
      <span className="font-medium text-foreground">{item.company}</span>
    </Link>
  );
}

export function JobTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const companies = await fetchCompanies();
        // Get top 15 companies
        const topCompanies = companies.slice(0, 15).map((c: any, i: number) => ({
          id: c.id,
          company: c.name,
          color: COLORS[i % COLORS.length],
        }));
        setTickerItems(topCompanies);
      } catch (err) {
        console.error("Failed to load ticker companies", err);
      }
    }
    loadCompanies();
  }, []);

  // Duplicate items for seamless infinite scroll
  const items = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : [];

  useEffect(() => {
    if (items.length === 0) return;

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
  }, [items.length]);

  if (tickerItems.length === 0) {
    return (
      <section className="relative border-y border-border/60 bg-background py-5 h-[62px]" />
    );
  }

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
