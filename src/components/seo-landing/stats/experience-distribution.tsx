"use client";
import { useEffect, useRef, useState } from "react";
import type { ExperienceDistribution } from "@/lib/stats-types";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// oklch values matching Tailwind sky/emerald/violet/rose 500
const BAND_STROKE: Record<string, string> = {
  "Entry (0–2 yrs)":  "oklch(0.623 0.168 237.6)",
  "Mid (3–5 yrs)":    "oklch(0.696 0.17 162.48)",
  "Senior (6–8 yrs)": "oklch(0.606 0.188 300.6)",
  "Staff+ (8+ yrs)":  "oklch(0.636 0.231 16.4)",
};

const BAND_DOT: Record<string, string> = {
  "Entry (0–2 yrs)":  "bg-sky-400",
  "Mid (3–5 yrs)":    "bg-emerald-400",
  "Senior (6–8 yrs)": "bg-violet-400",
  "Staff+ (8+ yrs)":  "bg-rose-400",
};

const SIZE = 120;
const STROKE = 20;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const GAP = 3; // px gap between segments

interface Props {
  distribution: ExperienceDistribution[];
}

export function ExperienceDistributionChart({ distribution }: Props) {
  if (!distribution.length) return null;

  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
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

        if (reduced) { setProgress(1); return; }

        const dur = 1300;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setProgress(easeOutCubic(p));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Derive segment arc positions from live progress value
  let cumFrac = 0;
  const segs = distribution.map((d) => {
    const frac = d.count / total;
    const arcLen = Math.max(0, frac * CIRC * progress - GAP);
    const dashOffset = CIRC - cumFrac * CIRC * progress;
    cumFrac += frac;
    return {
      band: d.band,
      pct: Math.round((d.count / total) * 100),
      arcLen,
      dashOffset,
    };
  });

  return (
    <div
      ref={ref}
      className="stat-card rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.05]"
    >
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-emerald-400">
        Experience breakdown
      </h3>

      <div className="flex items-center gap-5">
        {/* Animated donut */}
        <div className="shrink-0">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
            aria-hidden
          >
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            {segs.map((seg) => (
              <circle
                key={seg.band}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={BAND_STROKE[seg.band] ?? "rgba(255,255,255,0.3)"}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${seg.arcLen} ${CIRC - seg.arcLen}`}
                strokeDashoffset={seg.dashOffset}
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <ul className="flex-1 space-y-2.5">
          {segs.map((seg) => (
            <li key={seg.band} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-white/80 min-w-0 truncate">
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${BAND_DOT[seg.band] ?? "bg-white/30"}`}
                />
                {seg.band}
              </span>
              <span className="text-white/50 tabular-nums shrink-0">{seg.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
