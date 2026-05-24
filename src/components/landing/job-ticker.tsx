"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { STATIC_COMPANIES } from "@/lib/companies-static";

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

const tickerItems: TickerItem[] = STATIC_COMPANIES.slice(0, 15).map((c, i) => ({
  id: c.id,
  company: c.name,
  color: COLORS[i % COLORS.length],
}));

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
    return <section className="relative py-5 h-[62px]" />;
  }

  return (
    <section className="relative py-5">
      <div
        className="overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 96px, black calc(100% - 96px), transparent)" }}
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
