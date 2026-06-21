"use client";
import type { PostingVelocity } from "@/lib/stats-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";

interface Props {
  tag: string;
  velocity: PostingVelocity;
}

export function PostingVelocityBlock({ tag, velocity }: Props) {
  const { thisWeek, lastWeek, changePercent } = velocity;

  const trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColour =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-white/50";

  return (
    <div className="stat-card rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.05]">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Hiring velocity
      </h3>
      <div className="flex items-end gap-6">
        <div>
          <p className="text-4xl font-bold text-white tabular-nums">
            <CountUp value={thisWeek} duration={1200} />
          </p>
          <p className="text-xs text-white/50 mt-1">new {tag} roles this week</p>
        </div>
        {lastWeek > 0 && (
          <div className={`flex items-center gap-1 pb-1 ${trendColour}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {Math.abs(changePercent)}%{" "}
              {trend !== "flat" ? "vs last week" : "unchanged"}
            </span>
          </div>
        )}
      </div>
      {lastWeek > 0 ? (
        <p className="mt-3 text-xs text-white/40">{lastWeek} roles posted the prior week</p>
      ) : (
        <p className="mt-3 text-xs text-white/30">No prior week data yet</p>
      )}
    </div>
  );
}
