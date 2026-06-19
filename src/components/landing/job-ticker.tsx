"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { STATIC_COMPANIES } from "@/lib/companies-static";

interface TickerItem {
  id: number;
  company: string;
  logo: string;
}

const tickerItems: TickerItem[] = STATIC_COMPANIES.map((c) => ({
  id: c.id,
  company: c.name,
  logo: c.logo,
}));

function TickerPill({ item }: { item: TickerItem }) {
  return (
    <Link
      href={`/jobs?company_id=${item.id}`}
      className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border/80 bg-secondary/80 py-2 pl-2.5 pr-4 text-sm transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-secondary hover:shadow-md hover:shadow-emerald-500/5"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.logo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full object-contain p-0.5"
        />
      </span>
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
        className="-my-3 overflow-hidden py-3"
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
