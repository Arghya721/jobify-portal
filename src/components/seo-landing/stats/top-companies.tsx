import type { TopCompany } from "@/lib/stats-types";
import { Building2 } from "lucide-react";

interface Props {
  tag: string;
  companies: TopCompany[];
}

export function TopCompanies({ tag, companies }: Props) {
  if (!companies.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-200 hover:border-emerald-500/30 hover:bg-white/[0.05]">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
        Top hiring companies
      </h3>
      <ul className="space-y-2">
        {companies.map((c, i) => (
          <li
            key={c.name}
            className="-mx-2 flex items-center justify-between rounded-md px-2 py-0.5 text-sm transition-colors hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-2 text-white/80">
              <span className="w-4 text-right text-white/30 font-mono text-xs">
                {i + 1}
              </span>
              <Building2 className="h-3.5 w-3.5 text-white/30 shrink-0" />
              {c.name}
            </span>
            <span className="text-white/50 tabular-nums">
              {c.openRoles} open
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
