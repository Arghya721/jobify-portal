"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState, parseAsString, parseAsBoolean, parseAsArrayOf, parseAsInteger } from "nuqs";
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
import { STATIC_COMPANIES } from "@/lib/companies-static";
import { sendGAEvent } from "@next/third-parties/google";

const PAGE_SIZE = 10;

interface FeedCache {
  filterKey: string;
  page: number;
  scrollY: number;
  nodes: any[];
  pageCount: number;
}

// Module-level — survives SPA navigation (e.g. job detail → back) so we can
// restore the exact page + scroll position without a refetch.
let feedCache: FeedCache | null = null;

const CATEGORIES = [
  "All Jobs",
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "AI/ML",
  "Mobile",
];

export function JobFeed() {
  const router = useRouter();
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
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
  const [expMin] = useQueryState("exp_min", parseAsInteger);
  const [expMax] = useQueryState("exp_max", parseAsInteger);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const filterKey = useMemo(
    () => [q, companyId, String(remote), country, region, city, JSON.stringify(tags), JSON.stringify(sources), String(showClosed), sort, since, String(expMin), String(expMax)].join("|"),
    [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, since, expMin, expMax]
  );

  // Capture cache validity exactly once (mount). Valid only if the cached
  // filters + page match the current URL state.
  const cacheHit = useRef<boolean | null>(null);
  if (cacheHit.current === null) {
    cacheHit.current = !!(feedCache && feedCache.filterKey === filterKey && feedCache.page === page);
  }
  const restoreTarget = useRef(cacheHit.current ? feedCache!.scrollY : 0);

  const [jobNodes, setJobNodes] = useState<any[]>(() => cacheHit.current ? feedCache!.nodes : []);
  const [pageCount, setPageCount] = useState(() => cacheHit.current ? feedCache!.pageCount : 0);
  const [isLoading, setIsLoading] = useState(!cacheHit.current);
  const [isMounted, setIsMounted] = useState(false);
  // Cards restored from cache (back-nav) must NOT replay the enter animation,
  // otherwise they appear to fade out/in. Cleared on the first real fetch.
  const [suppressEnter, setSuppressEnter] = useState(cacheHit.current);

  useEffect(() => setIsMounted(true), []);

  // Guards so a filter change (which resets page → 1) doesn't also fetch the
  // stale page number in the same tick.
  const prevFilterKey = useRef(filterKey);
  const pendingReset = useRef(false);
  // Identifies the data currently held. Pre-seeded on a cache hit so the exact
  // restored page+filter never triggers a refetch (which would flash the list).
  const loadedKey = useRef<string | null>(cacheHit.current ? `${filterKey}__${page}` : null);
  const scrollYRef = useRef(0);
  const stateRef = useRef<FeedCache>({ filterKey, page, scrollY: 0, nodes: [], pageCount: 0 });

  const fetchJobs = useCallback(async (targetPage: number) => {
    setSuppressEnter(false);
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        sort,
        limit: PAGE_SIZE,
        page: targetPage,
      };

      if (q) params.q = q;
      if (companyId) params.company_id = parseInt(companyId);
      if (remote) params.remote = remote;
      if (country) params.country = country;
      if (region) params.region = region;
      if (city) params.city = city;
      if (tags.length > 0) params.description_tags = tags;
      if (sources.length > 0) params.source = sources[0];
      params.is_active = !showClosed;
      if (since && since !== "any") {
        const keyToDays: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30 };
        const days = keyToDays[since];
        if (days) {
          const d = new Date();
          d.setDate(d.getDate() - days);
          params.since = d.toISOString();
        }
      }
      if (expMin != null) params.experience_min = expMin;
      if (expMax != null) params.experience_max = expMax;

      const response = await fetchJobsAction(params);
      setJobNodes(response.ui);
      setPageCount(response.count);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobNodes([]);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, since, expMin, expMax]);

  // Filter changed → jump back to page 1.
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      pendingReset.current = true;
      setPage(1);
    }
  }, [filterKey, setPage]);

  // Single fetch driver — runs on initial mount, filter change, and page change.
  useEffect(() => {
    // While a filter-triggered page reset is in flight, skip the stale-page fetch.
    if (pendingReset.current && page !== 1) return;
    pendingReset.current = false;
    const key = `${filterKey}__${page}`;
    // Already holding this exact data (initial cache restore, or nuqs re-render
    // churn that doesn't actually change the page/filters) — don't refetch.
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    fetchJobs(page);
  }, [page, filterKey, fetchJobs]);

  // Track scroll position for the cache.
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore scroll on back-navigation. Cached nodes render synchronously so the
  // page height is available immediately; retry a few frames to beat Next.js's
  // default scroll-to-top on navigation.
  useEffect(() => {
    const target = restoreTarget.current;
    if (!cacheHit.current || target <= 0) return;
    let raf = 0;
    let tries = 0;
    const restore = () => {
      window.scrollTo(0, target);
      tries++;
      if (tries < 12 && Math.abs(window.scrollY - target) > 2) {
        raf = requestAnimationFrame(restore);
      }
    };
    restore();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep stateRef current, then persist to the module cache on unmount.
  useEffect(() => {
    stateRef.current = { filterKey, page, scrollY: scrollYRef.current, nodes: jobNodes, pageCount };
  });
  useEffect(() => () => {
    // Guard against StrictMode's throwaway unmount clobbering a good scrollY with 0.
    const y = scrollYRef.current > 0 ? scrollYRef.current : (feedCache ? feedCache.scrollY : 0);
    feedCache = { ...stateRef.current, scrollY: y };
  }, []);

  const goToPage = useCallback((target: number) => {
    if (target < 1 || target === page) return;
    sendGAEvent("event", "page_change", { page: target });
    setPage(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, setPage]);

  const hasNext = pageCount === PAGE_SIZE;
  const hasResults = jobNodes.length > 0;
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart + pageCount - 1;

  const searchLabel = q
    ? `for '${q}'`
    : companyId
    ? `at ${STATIC_COMPANIES.find(c => c.id === parseInt(companyId))?.name ?? `company ${companyId}`}`
    : "";

  // Compact windowed page numbers (no total count from backend, so we only
  // show neighbours we know exist).
  const windowPages: number[] = [];
  for (let p = Math.max(1, page - 1); p <= page; p++) windowPages.push(p);
  if (hasNext) windowPages.push(page + 1);
  const showLeadingPage = windowPages[0] > 1;

  return (
    <div className="flex-1 space-y-4">
      {/* Header with Categories and Sort */}
      <div className="flex flex-col gap-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" suppressHydrationWarning>
            {CATEGORIES.map((cat) => {
              const isActive = isMounted
                ? (cat === "All Jobs" ? !q || q === "All Jobs" : q?.toLowerCase() === cat.toLowerCase())
                : (cat === "All Jobs");
              return (
                <button
                  key={cat}
                  onClick={() => { sendGAEvent("event", "category_filter", { category: cat }); setQ(cat === "All Jobs" ? null : cat); }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "border-muted-foreground bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/40 hover:text-foreground/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Sort by:</span>
            <Select value={sort} onValueChange={(v) => { sendGAEvent("event", "sort_change", { value: v }); setSort(v); }}>
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

        {/* Results range label */}
        {hasResults && (
          <p className="text-sm">
            <span className="font-semibold text-emerald-400">
              {isLoading ? "..." : `${rangeStart}–${rangeEnd}`}
            </span>{" "}
            <span className="text-muted-foreground">
              {searchLabel ? `result${rangeEnd - rangeStart !== 0 ? "s" : ""} ${searchLabel}` : "on this page"}
            </span>
          </p>
        )}
      </div>

      {/* Loading Skeletons (full-page swap) */}
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

      {/* Suppress the enter animation for cards restored from cache (back-nav) */}
      {suppressEnter && (
        <style>{`.job-feed-list > .job-card-enter { animation: none !important; opacity: 1 !important; transform: none !important; }`}</style>
      )}

      {/* Job List */}
      <div
        className={cn(
          "space-y-3 transition-opacity duration-300 job-feed-list",
          isLoading && jobNodes.length > 0 && "opacity-40 blur-[2px] pointer-events-none"
        )}
      >
        {jobNodes}

        {!isLoading && jobNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-4 py-16 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border/60 bg-secondary/50">
              <SearchX className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {page > 1 ? "Nothing on this page" : "No jobs match these filters"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground/70">
              {page > 1
                ? "You may have gone past the last page."
                : "Try a broader search term, or clear everything and start fresh."}
            </p>
            <button
              onClick={() => page > 1 ? goToPage(1) : router.push("/jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-5 py-2 text-sm font-medium text-emerald-400 transition-[transform,border-color,background-color] duration-150 hover:border-emerald-500/50 hover:bg-emerald-500/12 active:scale-[0.97]"
            >
              {page > 1 ? "Back to first page" : "Clear all filters"}
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(hasResults || page > 1) && (
        <nav
          className="flex items-center justify-center gap-1.5 pt-4"
          aria-label="Pagination"
        >
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isLoading}
            aria-label="Previous page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-secondary/40 px-3 text-sm font-medium text-foreground transition-[transform,border-color,background-color,opacity] duration-150 hover:border-border/80 hover:bg-secondary/70 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-secondary/40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {showLeadingPage && (
            <>
              <PagePill page={1} active={false} disabled={isLoading} onClick={goToPage} />
              <span className="px-1 text-muted-foreground/60" aria-hidden="true">…</span>
            </>
          )}

          {windowPages.map((p) => (
            <PagePill key={p} page={p} active={p === page} disabled={isLoading} onClick={goToPage} />
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={!hasNext || isLoading}
            aria-label="Next page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-secondary/40 px-3 text-sm font-medium text-foreground transition-[transform,border-color,background-color,opacity] duration-150 hover:border-border/80 hover:bg-secondary/70 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-secondary/40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

function PagePill({
  page,
  active,
  disabled,
  onClick,
}: {
  page: number;
  active: boolean;
  disabled: boolean;
  onClick: (p: number) => void;
}) {
  return (
    <button
      onClick={() => onClick(page)}
      disabled={disabled || active}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-[transform,border-color,background-color,color] duration-150 active:scale-[0.97] disabled:cursor-default",
        active
          ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-border/80 hover:bg-secondary/70 hover:text-foreground disabled:opacity-40"
      )}
    >
      {page}
    </button>
  );
}
