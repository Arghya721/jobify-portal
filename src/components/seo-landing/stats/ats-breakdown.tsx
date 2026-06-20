import type { AtsBreakdown } from "@/lib/stats-types";

interface Props {
  breakdown: AtsBreakdown[];
}

/** Maps raw job_source values to display names */
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

export function AtsBreakdownBlock({ breakdown }: Props) {
  if (!breakdown.length) return null;

  const total = breakdown.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-200 hover:border-emerald-500/30 hover:bg-white/[0.05]">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-1">
        Sourced directly from ATS
      </h3>
      <p className="text-xs text-white/40 mb-4">
        No job board markup. Direct from company career pages.
      </p>
      <ul className="space-y-2">
        {breakdown.map((b) => {
          const pct = Math.round((b.count / total) * 100);
          const label = SOURCE_LABELS[b.source.toLowerCase()] ?? b.source;
          return (
            <li key={b.source} className="flex items-center justify-between text-sm">
              <span className="text-white/80">{label}</span>
              <span className="flex items-center gap-3">
                <span className="text-white/40 text-xs tabular-nums">{pct}%</span>
                <span className="text-white/50 tabular-nums">{b.count.toLocaleString()}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
