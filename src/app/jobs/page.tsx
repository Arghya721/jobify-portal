import { Suspense } from "react";
import Link from "next/link";
import { SEO_NAV_LINKS } from "@/config/seo-pages";
import { SearchOmnibar } from "@/components/search/search-omnibar";
import { QuickToggles } from "@/components/search/quick-toggles";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { MobileFilterSheet } from "@/components/search/mobile-filter-sheet";
import { JobFeed } from "@/components/search/job-feed";
import { getSavedFiltersAction } from "@/app/actions/saved-filters";
import { getResumeUploadsAction, JobsQuery } from "@/app/actions/resume";

export const metadata = {
  title: "Search Jobs — Jobify",
  description: "Find your next engineering role. Filter by tech stack, location, remote, and more.",
};

const MAX_FILTERS = 3;

export default async function JobsPage() {
  // Fetch saved filters server-side so the access token never leaves the server.
  // Gracefully falls back to empty array for unauthenticated users.
  // We pass `false` so a revoked session (401) fails silently rather than redirecting to logout.
  const { filters: savedFilters } = await getSavedFiltersAction(false);

  // Latest completed resume query — null if none or not logged in
  const { uploads } = await getResumeUploadsAction();
  const resumeJobsQuery: JobsQuery | null =
    uploads.find((u) => u.status === "completed")?.jobs_query ?? null;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Find your next role
        </h1>
      </div>

      {/* Popular stacks — curated landing pages */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Popular stacks
        </span>
        {SEO_NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-border/50 bg-card/40 px-3 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:border-emerald-500/40 hover:text-emerald-400"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Omnibar */}
      <div className="mb-5">
        <Suspense fallback={null}>
          <SearchOmnibar />
        </Suspense>
      </div>

      {/* Quick Toggles + Mobile Filters */}
      <div className="mb-6 flex items-center gap-3">
        <Suspense fallback={null}>
          <QuickToggles resumeJobsQuery={resumeJobsQuery} />
        </Suspense>
        <Suspense fallback={null}>
          <MobileFilterSheet savedFilters={savedFilters} maxFilters={MAX_FILTERS} />
        </Suspense>
      </div>

      {/* Main Layout: Sidebar + Feed */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden w-[240px] shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Suspense fallback={null}>
              <FilterSidebar savedFilters={savedFilters} maxFilters={MAX_FILTERS} />
            </Suspense>
          </div>
        </div>

        {/* Job Feed */}
        <Suspense fallback={null}>
          <JobFeed />
        </Suspense>
      </div>
    </div>
  );
}
