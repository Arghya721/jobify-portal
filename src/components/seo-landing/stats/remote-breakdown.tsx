"use client";
import { useEffect, useRef, useState } from "react";
import type { RemoteBreakdown } from "@/lib/stats-types";
import { Wifi, Building } from "lucide-react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
}

function RingChart({ pct, size = 104, stroke = 10 }: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [filled, setFilled] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilled(pct);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const dur = 1300;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setFilled(easeOutCubic(p) * pct);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pct]);

  const offset = circ * (1 - filled / 100);

  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.696 0.17 162.48)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-bold text-white tabular-nums">
          {Math.round(filled)}%
        </span>
        <span className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">remote</span>
      </div>
    </div>
  );
}

interface Props {
  breakdown: RemoteBreakdown;
}

export function RemoteBreakdownBlock({ breakdown }: Props) {
  const { remote, onsite, total } = breakdown;
  if (total === 0) return null;

  const remotePct = Math.round((remote / total) * 100);
  const onsitePct = 100 - remotePct;

  return (
    <div className="stat-card rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.05]">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">
        Remote vs onsite
      </h3>
      <div className="flex items-center gap-6">
        <RingChart pct={remotePct} />
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2.5">
            <Wifi className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-lg font-bold text-white tabular-nums">{remotePct}%</p>
              <p className="text-xs text-white/50">Remote-friendly</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Building className="h-4 w-4 text-white/40 shrink-0" />
            <div>
              <p className="text-lg font-bold text-white tabular-nums">{onsitePct}%</p>
              <p className="text-xs text-white/50">Onsite / Hybrid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
