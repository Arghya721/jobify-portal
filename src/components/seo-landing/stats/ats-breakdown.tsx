"use client";
import { useEffect, useRef, useState } from "react";
import type { AtsBreakdown } from "@/lib/stats-types";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const SOURCE_LABELS: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  workday: "Workday",
  ashby: "Ashby",
  smartrecruiters: "SmartRecruiters",
  icims: "iCIMS",
  taleo: "Taleo",
  jobvite: "Jobvite",
  recruitee: "Recruitee",
  unknown: "Other",
};

interface Props {
  breakdown: AtsBreakdown[];
}

export function AtsBreakdownBlock({ breakdown }: Props) {
  if (!breakdown.length) return null;

  const total = breakdown.reduce((sum, b) => sum + b.count, 0);
  const ref = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<number[]>(breakdown.map(() => 0));
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        if (reduced) {
          setWidths(breakdown.map((b) => (b.count / total) * 100));
          return;
        }

        breakdown.forEach((b, i) => {
          const target = (b.count / total) * 100;
          setTimeout(() => {
            const dur = 900;
            const t0 = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - t0) / dur, 1);
              const v = easeOutCubic(p) * target;
              setWidths((prev) => {
                const next = [...prev];
                next[i] = v;
                return next;
              });
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, i * 70);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="stat-card rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.05]"
    >
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-1">
        Sourced directly from ATS
      </h3>
      <p className="text-xs text-white/40 mb-4">
        No job board markup. Direct from company career pages.
      </p>
      <ul className="space-y-3">
        {breakdown.map((b, i) => {
          const pct = Math.round((b.count / total) * 100);
          const label = SOURCE_LABELS[b.source.toLowerCase()] ?? b.source;
          return (
            <li key={b.source}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-white/80">{label}</span>
                <span className="flex items-center gap-3">
                  <span className="text-white/40 text-xs tabular-nums">{pct}%</span>
                  <span className="text-white/50 tabular-nums">{b.count.toLocaleString()}</span>
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/50"
                  style={{ width: `${widths[i]}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
