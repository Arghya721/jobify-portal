"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useQueryState, parseAsString, parseAsBoolean, parseAsArrayOf } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJobsAction } from "@/app/actions/jobs";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function JobFeed() {
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [companyId] = useQueryState("company_id", parseAsString.withDefault(""));
  const [remote] = useQueryState("remote", parseAsBoolean.withDefault(false));
  const [country] = useQueryState("country", parseAsString.withDefault(""));
  const [region] = useQueryState("region", parseAsString.withDefault(""));
  const [city] = useQueryState("city", parseAsString.withDefault(""));
  const [tags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));
  const [sources] = useQueryState("source", parseAsArrayOf(parseAsString).withDefault([]));
  const [showClosed] = useQueryState("show_closed", parseAsBoolean.withDefault(false));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("desc"));
  const [since] = useQueryState("since", parseAsString.withDefault(""));

  const [jobNodes, setJobNodes] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastFetchCount, setLastFetchCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from server action
  const fetchJobs = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setPage(1);
    }
    
    // Conditionally build params so we don't send Next.js "$undefined" string payloads
    const params: Record<string, any> = {
      sort,
      limit: PAGE_SIZE,
      page: isLoadMore ? page + 1 : 1,
    };

    if (q) params.q = q;
    if (companyId) params.company_id = parseInt(companyId);
    if (remote) params.remote = remote;
    if (country) params.country = country;
    if (region) params.region = region;
    if (city) params.city = city;
    if (tags.length > 0) params.description_tags = tags;
    if (sources.length > 0) params.source = sources[0];
    if (!showClosed) params.is_active = true;
    if (since && since !== "any") {
      const keyToDays: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30 };
      const days = keyToDays[since];
      if (days) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        params.since = d.toISOString();
      }
    }

    const response = await fetchJobsAction(params);
    
    if (isLoadMore) {
      setJobNodes(prev => [...prev, ...response.ui]);
      setTotalCount(prev => prev + response.count);
      setPage(p => p + 1);
      setIsLoadMorePending(false);
    } else {
      setJobNodes(response.ui);
      setTotalCount(response.count);
      setIsLoading(false);
    }
    setLastFetchCount(response.count);

  }, [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, page, since]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchJobs(false);
  }, [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, since]);

  const hasMore = lastFetchCount === PAGE_SIZE;

  const searchLabel = q
    ? `for '${q}'`
    : companyId
    ? `at company ${companyId}`
    : "";

  return (
    <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <span className="font-semibold text-emerald-400">
            {isLoading ? "..." : totalCount}
          </span>{" "}
          <span className="text-muted-foreground">
            result{totalCount !== 1 ? "s" : ""} {searchLabel} (Loaded viewing)
          </span>
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Sort by:</span>
          <Select value={sort} onValueChange={(v) => { setSort(v); }}>
            <SelectTrigger className="h-8 w-[110px] border-border bg-secondary/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && jobNodes.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card/50 p-5"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="h-11 w-11 rounded-lg bg-secondary/80" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                     <Skeleton className="h-5 w-[40%] bg-secondary/80" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                     <Skeleton className="h-4 w-[20%] bg-secondary/80" />
                     <Skeleton className="h-4 w-[25%] bg-secondary/80" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-md bg-secondary/80" />
                    <Skeleton className="h-5 w-16 rounded-md bg-secondary/80" />
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                  <Skeleton className="h-5 w-20 bg-secondary/80" />
                  <Skeleton className="h-3 w-16 bg-secondary/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job List */}
      <div 
        className={cn(
          "space-y-3 transition-opacity duration-300", 
          isLoading && jobNodes.length > 0 && "opacity-40 blur-[2px] pointer-events-none"
        )}
      >
        {jobNodes}

        {!isLoading && jobNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No jobs found
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              setIsLoadMorePending(true);
              fetchJobs(true);
            }}
            className="rounded-xl border border-border/60 bg-secondary/30 px-8 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary/50 hover:text-foreground"
          >
            {isLoadMorePending ? "Loading..." : "Load More Results"}
          </button>
        </div>
      )}
    </div>
  );
}
