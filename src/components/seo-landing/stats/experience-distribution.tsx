import { ExperienceDistribution } from "@/lib/api-server";

interface Props {
  distribution: ExperienceDistribution[];
}

export function ExperienceDistributionChart({ distribution }: Props) {
  if (!distribution.length) return null;

  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  const colours: Record<string, string> = {
    "Entry (0–2 yrs)": "bg-sky-500/70",
    "Mid (3–5 yrs)": "bg-emerald-500/70",
    "Senior (6–8 yrs)": "bg-violet-500/70",
    "Staff+ (8+ yrs)": "bg-rose-500/70",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Experience breakdown
      </h3>

      {/* Stacked bar */}
      <div className="flex h-3 w-full rounded-full overflow-hidden gap-px mb-5">
        {distribution.map((d) => (
          <div
            key={d.band}
            className={`${colours[d.band] ?? "bg-white/30"} transition-all`}
            style={{ width: `${(d.count / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="space-y-2">
        {distribution.map((d) => (
          <li key={d.band} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/80">
              <span
                className={`inline-block h-2 w-2 rounded-full ${colours[d.band] ?? "bg-white/30"}`}
              />
              {d.band}
            </span>
            <span className="text-white/50">
              {Math.round((d.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
