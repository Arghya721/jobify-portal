"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "@/components/search/job-card";
import { fetchJobsAction } from "@/app/actions/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "All Jobs",
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "AI/ML",
  "Mobile",
];

export function LandingJobFeedClient({ initialJobs }: { initialJobs: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  // fetchedNodes holds pre-rendered JSX from fetchJobsAction
  const [fetchedNodes, setFetchedNodes] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(initialJobs.length === 0);

  const fetchByCategory = useCallback(async (category: string, sortOrder: string) => {
    setIsLoading(true);

    const params: Record<string, any> = {
      limit: 10,
      sort: sortOrder,
      is_active: true,
    };

    if (category !== "All Jobs") {
      params.description_tags = [category];
    }

    try {
      const response = await fetchJobsAction(params);
      // response.ui is already rendered <JobCard> components
      setFetchedNodes(response.ui);
    } catch (err) {
      console.error("Failed to fetch jobs for category:", category, err);
      setFetchedNodes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Server-rendered jobs already match the default view — reuse them
    if (activeCategory === "All Jobs" && sort === "desc" && initialJobs.length > 0) {
      setFetchedNodes(null);
      return;
    }

    // Otherwise, fetch jobs from the client (for both mounting and category changes)
    fetchByCategory(activeCategory, sort);
  }, [activeCategory, sort, initialJobs.length, fetchByCategory]);

  // Determine what to render
  const useInitial = fetchedNodes === null && initialJobs.length > 0;
  // If we are still loading on mount, treat it as not having jobs yet so skeletons show
  const hasJobs = useInitial ? initialJobs.length > 0 : (fetchedNodes && fetchedNodes.length > 0);

  return (
    <>
      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-[border-color,background-color,color] duration-150 active:scale-[0.97] ${
                activeCategory === cat
                  ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                  : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Sort by:</span>
          <Select value={sort} onValueChange={(v) => setSort(v as "desc" | "asc")}>
            <SelectTrigger className="h-8 w-[125px] border-border bg-secondary/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="mt-8 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-11 w-11 rounded-lg bg-secondary/80" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-[40%] bg-secondary/80" />
                  <div className="mt-1.5 flex gap-3">
                    <Skeleton className="h-4 w-[20%] bg-secondary/80" />
                    <Skeleton className="h-4 w-[25%] bg-secondary/80" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : hasJobs ? (
          useInitial
            ? initialJobs.map((job: any, i: number) => (
                <JobCard key={job.id} job={job} index={i} />
              ))
            : fetchedNodes  // Already rendered <JobCard> components from the server action
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No jobs found matching your criteria.
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="mt-8 flex justify-center">
        <a
          href={activeCategory === "All Jobs" ? "/jobs" : `/jobs?tags=${activeCategory}`}
          className="rounded-full border border-border/50 px-8 py-3 text-sm font-medium text-muted-foreground transition-[border-color,background-color,color] duration-150 hover:border-border hover:bg-secondary/60 hover:text-foreground active:scale-[0.97]"
        >
          Browse all open roles
        </a>
      </div>
    </>
  );
}

