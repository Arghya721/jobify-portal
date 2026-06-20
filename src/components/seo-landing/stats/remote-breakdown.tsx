import type { RemoteBreakdown } from "@/lib/stats-types";
import { Wifi, Building } from "lucide-react";

interface Props {
  breakdown: RemoteBreakdown;
}

export function RemoteBreakdownBlock({ breakdown }: Props) {
  const { remote, onsite, total } = breakdown;
  if (total === 0) return null;

  const remotePct = Math.round((remote / total) * 100);
  const onsitePct = 100 - remotePct;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-200 hover:border-emerald-500/30 hover:bg-white/[0.05]">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Remote vs onsite
      </h3>
      <div className="flex h-2 w-full rounded-full overflow-hidden mb-5">
        <div
          className="bar-fill bg-emerald-500/70 h-full"
          style={{ width: `${remotePct}%` }}
        />
        <div
          className="bar-fill bg-white/20 h-full"
          style={{ width: `${onsitePct}%`, ["--bar-delay" as string]: "120ms" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-emerald-400" />
          <div>
            <p className="text-lg font-bold text-white tabular-nums">{remotePct}%</p>
            <p className="text-xs text-white/50">Remote</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-white/40" />
          <div>
            <p className="text-lg font-bold text-white tabular-nums">{onsitePct}%</p>
            <p className="text-xs text-white/50">Onsite / Hybrid</p>
          </div>
        </div>
      </div>
    </div>
  );
}
