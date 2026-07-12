import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";

interface SimilarJobsLinkProps {
  tags: string[];
  companyId?: string;
  companyName: string;
}

// Deliberately static — no backend fetch, no Suspense. An earlier version
// rendered a live "similar jobs" strip via a gRPC query, but that query could
// hang/fail on the backend and stall the whole page. A plain link to the
// pre-filtered feed gets the same discovery value with zero fetch risk.
export function SimilarJobsLink({ tags, companyId, companyName }: SimilarJobsLinkProps) {
  const hasCompany = companyId && companyId !== "0";
  if (tags.length === 0 && !hasCompany) return null;

  const href =
    tags.length > 0
      ? `/jobs?${new URLSearchParams({ tags: tags.slice(0, 5).join(",") })}`
      : `/jobs?${new URLSearchParams({ company_id: String(companyId) })}`;
  const label = tags.length > 0 ? "See similar jobs" : `See more jobs at ${companyName}`;

  return (
    <TrackedLink
      href={href}
      event="job_detail_similar_jobs_link_click"
      className="flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card/60 p-5 text-sm font-medium text-emerald-400 transition-colors duration-150 hover:border-emerald-500/40 hover:bg-card/80"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </TrackedLink>
  );
}
