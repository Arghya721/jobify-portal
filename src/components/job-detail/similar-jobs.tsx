import { fetchJobs } from "@/lib/api-server";
import { JobCard } from "@/components/search/job-card";
import { GAClickArea } from "@/components/analytics/ga-click-area";
import { TrackedLink } from "@/components/analytics/tracked-link";

interface SimilarJobsProps {
  currentJobId: string | number;
  tags: string[];
  companyId?: string;
  companyName: string;
}

interface JobSummaryLike {
  id: string | number;
  [key: string]: unknown;
}

type SimilarJobsResult = {
  jobs: JobSummaryLike[];
  source: "tags" | "company";
};

// Fetching is isolated here so a backend blip never takes down the page —
// the section simply doesn't render.
async function loadSimilarJobs({
  currentJobId,
  tags,
  companyId,
}: SimilarJobsProps): Promise<SimilarJobsResult | null> {
  try {
    const excludeSelf = (jobs: JobSummaryLike[]) =>
      jobs.filter((j) => String(j.id) !== String(currentJobId)).slice(0, 5);

    let jobs: JobSummaryLike[] = [];
    let source: "tags" | "company" = "tags";

    if (tags.length > 0) {
      const { data } = await fetchJobs({
        description_tags: tags.slice(0, 5),
        is_active: true,
        limit: 6,
        page: 1,
        sort: "desc",
      });
      jobs = excludeSelf(data);
    }

    const hasCompany = companyId && companyId !== "0";
    if (jobs.length < 2 && hasCompany) {
      const { data } = await fetchJobs({
        company_id: parseInt(companyId, 10),
        is_active: true,
        limit: 6,
        page: 1,
        sort: "desc",
      });
      const companyJobs = excludeSelf(data);
      if (companyJobs.length > jobs.length) {
        jobs = companyJobs;
        source = "company";
      }
    }

    return jobs.length > 0 ? { jobs, source } : null;
  } catch (error) {
    console.warn("Similar jobs unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function SimilarJobs(props: SimilarJobsProps) {
  const result = await loadSimilarJobs(props);
  if (!result) return null;

  const { jobs, source } = result;
  const viewAllUrl =
    source === "tags"
      ? `/jobs?${new URLSearchParams({ tags: props.tags.slice(0, 5).join(",") })}`
      : `/jobs?${new URLSearchParams({ company_id: String(props.companyId) })}`;

  return (
    <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
        {source === "tags" ? "Similar jobs" : `More jobs at ${props.companyName}`}
      </h2>
      <GAClickArea
        event="job_detail_similar_job_click"
        eventParams={{ source }}
        className="space-y-3"
      >
        {jobs.map((job, i) => (
          <JobCard key={job.id} job={job} index={i} />
        ))}
      </GAClickArea>
      <TrackedLink
        href={viewAllUrl}
        event="job_detail_view_all_click"
        eventParams={{ source }}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
      >
        View all matching jobs →
      </TrackedLink>
    </section>
  );
}

export function SimilarJobsSkeleton() {
  return (
    <section className="space-y-3 rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[104px] animate-pulse rounded-xl border border-border/40 bg-card/40" />
      ))}
    </section>
  );
}
