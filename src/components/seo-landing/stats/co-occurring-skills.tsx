"use client";
import { useEffect, useRef, useState } from "react";
import type { CoOccurringSkill } from "@/lib/stats-types";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface BarProps {
  targetPct: number;
  delay: number;
  visible: boolean;
}

function AnimatedBar({ targetPct, delay, visible }: BarProps) {
  const [width, setWidth] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWidth(targetPct);
      return;
    }
    const timer = setTimeout(() => {
      const dur = 900;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        setWidth(easeOutCubic(p) * targetPct);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [visible, targetPct, delay]);

  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-emerald-500/70 transition-colors duration-200 group-hover:bg-emerald-400/80"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

interface Props {
  tag: string;
  skills: CoOccurringSkill[];
}

export function CoOccurringSkills({ tag, skills }: Props) {
  if (!skills.length) return null;

  const max = skills[0].mentions;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="stat-card group rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.05]"
    >
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Often hired with {tag}
      </h3>
      <ul className="space-y-3">
        {skills.map((skill, i) => (
          <li key={skill.tag}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/90">{skill.tag}</span>
              <span className="text-xs text-white/50 tabular-nums">{skill.pct}% of roles</span>
            </div>
            <AnimatedBar
              targetPct={(skill.mentions / max) * 100}
              delay={i * 80}
              visible={visible}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
