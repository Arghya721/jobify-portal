"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "@/components/search/job-card";
import { fetchJobsAction } from "@/app/actions/jobs";
import { Skeleton } from "@/components/ui/skeleton";

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
  // fetchedNodes holds pre-rendered JSX from fetchJobsAction
  const [fetchedNodes, setFetchedNodes] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchByCategory = useCallback(async (category: string) => {
    setIsLoading(true);

    const params: Record<string, any> = {
      limit: 10,
      sort: "desc",
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
    if (activeCategory === "All Jobs") {
      setFetchedNodes(null); // use initialJobs instead
      return;
    }
    fetchByCategory(activeCategory);
  }, [activeCategory, fetchByCategory]);

  // Determine what to render
  const useInitial = fetchedNodes === null;
  const hasJobs = useInitial ? initialJobs.length > 0 : fetchedNodes.length > 0;

  return (
    <>
      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "border-muted-foreground bg-secondary text-foreground"
                  : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/40 hover:text-foreground/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sort by:</span>
          <select className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border/50">
            <option>Newest First</option>
            <option>Oldest First</option>
          </select>
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
          className="rounded-xl border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border/80 hover:bg-secondary/60 hover:text-foreground"
        >
          Explore All Opportunities
        </a>
      </div>
    </>
  );
}

