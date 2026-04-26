import { Suspense } from "react";
import { SearchOmnibar } from "@/components/search/search-omnibar";
import { QuickToggles } from "@/components/search/quick-toggles";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { MobileFilterSheet } from "@/components/search/mobile-filter-sheet";
import { JobFeed } from "@/components/search/job-feed";
import { getSavedFiltersAction } from "@/app/actions/saved-filters";

export const metadata = {
  title: "Search Jobs — Jobify",
  description: "Find your next engineering role. Filter by tech stack, location, remote, and more.",
};

const MAX_FILTERS = 3;

export default async function JobsPage() {
  // Fetch saved filters server-side so the access token never leaves the server.
  // Gracefully falls back to empty array for unauthenticated users.
  const { filters: savedFilters } = await getSavedFiltersAction();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Find Your Next Role
        </h1>
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
          <QuickToggles />
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
