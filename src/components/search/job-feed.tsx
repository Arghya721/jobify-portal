"use client";

import { useEffect, useLayoutEffect, useState, useCallback, useRef, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
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

// Global flag to detect initial hydration pass.
// Fast Refresh re-evaluates the module, resetting this to true,
// preventing hydration mismatches in development.
let isInitialHydration = true;
if (typeof window !== "undefined") {
  setTimeout(() => {
    isInitialHydration = false;
  }, 0);
}

interface FeedCache {
  nodes: ReactNode[];
  page: number;
  scrollY: number;
  filterKey: string;
  totalCount: number;
  lastFetchCount: number;
  seenIds: number[];
}

// Module-level — survives SPA navigations within the same session
let feedCache: FeedCache | null = null;

const PAGE_SIZE = 10;

function getUrlFilterKey(): string {
  if (typeof window === "undefined") return "";
  
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || "";
  const companyId = searchParams.get("company_id") || "";
  const remote = searchParams.get("remote") === "true";
  const country = searchParams.get("country") || "";
  const region = searchParams.get("region") || "";
  const city = searchParams.get("city") || "";
  
  const getArrayParam = (key: string) => {
    const values = searchParams.getAll(key);
    if (values.length === 1 && values[0] !== "") {
      // nuqs parses comma-separated lists
      return values[0].split(",");
    }
    return values.filter(Boolean);
  };
  
  const tags = getArrayParam("tags");
  const sources = getArrayParam("source");
  const showClosed = searchParams.get("show_closed") === "true";
  const sort = searchParams.get("sort") || "desc";
  const since = searchParams.get("since") || "";
  
  const expMinStr = searchParams.get("exp_min");
  const expMin = expMinStr ? parseInt(expMinStr) : null;
  const expMaxStr = searchParams.get("exp_max");
  const expMax = expMaxStr ? parseInt(expMaxStr) : null;

  return [
    q,
    companyId,
    String(remote),
    country,
    region,
    city,
    JSON.stringify(tags),
    JSON.stringify(sources),
    String(showClosed),
    sort,
    since,
    String(expMin),
    String(expMax)
  ].join("|");
}

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

  const filterKey = useMemo(
    () => [q, companyId, String(remote), country, region, city, JSON.stringify(tags), JSON.stringify(sources), String(showClosed), sort, since, String(expMin), String(expMax)].join("|"),
    [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, since, expMin, expMax]
  );

  const isCacheValid = !isInitialHydration && feedCache && (feedCache.filterKey === filterKey || (typeof window !== "undefined" && feedCache.filterKey === getUrlFilterKey()));

  const [jobNodes, setJobNodes] = useState<any[]>(() => isCacheValid ? feedCache!.nodes : []);
  const [totalCount, setTotalCount] = useState(() => isCacheValid ? feedCache!.totalCount : 0);
  const [lastFetchCount, setLastFetchCount] = useState(() => isCacheValid ? feedCache!.lastFetchCount : 0);
  const pageRef = useRef(isCacheValid ? feedCache!.page : 1);
  const restoredCount = useRef(isCacheValid ? feedCache!.nodes.length : 0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);
  const isFetchingMore = useRef(false);
  const seenJobIds = useRef<Set<number>>(new Set(isCacheValid ? feedCache!.seenIds : []));
  const [isLoading, setIsLoading] = useState(!isCacheValid);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const scrollYRef = useRef(0);
  const savedScrollRef = useRef<number | null>(null);
  const isFirstRun = useRef(true);
  const prevFilterKey = useRef(typeof window !== "undefined" ? getUrlFilterKey() : filterKey);
  const stateRef = useRef<FeedCache>({ nodes: [], page: 1, scrollY: 0, filterKey: "", totalCount: 0, lastFetchCount: 0, seenIds: [] });
  // Blocks IntersectionObserver from triggering load-more during the 800 ms
  // after back-nav scroll restoration. Without this, the observer can fire
  // immediately (loader is in the restored viewport), call a Server Action,
  // and Next.js's router-cache flush resets scroll to 0 before we can correct.
  const [scrollJustRestored, setScrollJustRestored] = useState(false);

  // Disable the browser's native scroll restoration for the lifetime of this
  // component. Without this, the browser competes with our manual scrollTo and
  // can override it 1-2 frames later, causing a visible jump on back-navigation.
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    return () => { history.scrollRestoration = "auto"; };
  }, []);

  // Restore scroll position resiliently on mount (back-navigation)
  useEffect(() => {
    if (!isCacheValid || !feedCache || feedCache.scrollY <= 0) return;
    const targetY = feedCache.scrollY;
    
    // Set state to block IntersectionObserver during restoration
    setScrollJustRestored(true);
    const tid = setTimeout(() => {
      setScrollJustRestored(false);
    }, 1200);

    let isCancelled = false;
    let attempts = 0;
    const maxAttempts = 80; // ~1.3 seconds at 60fps
    
    const restoreScroll = () => {
      if (isCancelled) return;
      
      const currentY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      if (maxScroll >= targetY) {
        if (Math.abs(currentY - targetY) > 2) {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }
        // Keep checking for a few frames to ensure it stays locked (fights late Next.js resets)
        if (Math.abs(window.scrollY - targetY) <= 2) {
          attempts++;
          if (attempts > 15) {
            return;
          }
        }
      } else {
        // Page hasn't reached full height yet; scroll to max available height for now
        if (maxScroll > 0 && Math.abs(currentY - maxScroll) > 2) {
          window.scrollTo({ top: maxScroll, behavior: "instant" });
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        requestAnimationFrame(restoreScroll);
      }
    };
    
    // Start restoration loop
    restoreScroll();
    
    // Cancel automatic restore if user manually scrolls away (non-zero scroll)
    let lastScrollY = window.scrollY;
    const handleUserScroll = () => {
      const currentY = window.scrollY;
      if (
        currentY !== 0 && 
        Math.abs(currentY - targetY) > 15 && 
        Math.abs(currentY - lastScrollY) > 5
      ) {
        isCancelled = true;
      }
      lastScrollY = currentY;
    };
    
    window.addEventListener("scroll", handleUserScroll, { passive: true });
    
    return () => {
      isCancelled = true;
      clearTimeout(tid);
      window.removeEventListener("scroll", handleUserScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch jobs from server action
  const fetchJobs = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setIsLoading(true);
        pageRef.current = 1;
      } else {
        // Prefer window.scrollY; fall back to the tracked ref in case Next.js's
        // router-cache flush already reset the scroll before this line runs.
        savedScrollRef.current = window.scrollY > 0 ? window.scrollY : scrollYRef.current;
      }
      
      const currentPage = isLoadMore ? pageRef.current + 1 : 1;

      // Conditionally build params so we don't send Next.js "$undefined" string payloads
      const params: Record<string, any> = {
        sort,
        limit: PAGE_SIZE,
        page: currentPage,
      };

      if (q) params.q = q;
      if (companyId) params.company_id = parseInt(companyId);
      if (remote) params.remote = remote;
      if (country) params.country = country;
      if (region) params.region = region;
      if (city) params.city = city;
      if (tags.length > 0) params.description_tags = tags;
      if (sources.length > 0) params.source = sources[0];
      if (!showClosed) {
        params.is_active = true;
      } else {
        params.is_active = false;
      }
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
      
      if (isLoadMore) {
        // Filter out any jobs we've already rendered to prevent duplicate
        // viewTransitionName values (which cause InvalidStateError).
        const newUi: any[] = [];
        const newIds: number[] = response.jobIds || [];
        for (let i = 0; i < response.ui.length; i++) {
          const id = newIds[i];
          // Skip items without a stable ID — they can't be deduplicated and
          // would create duplicate React keys if the API returns them on multiple pages.
          if (id == null || seenJobIds.current.has(id)) continue;
          seenJobIds.current.add(id);
          newUi.push(response.ui[i]);
        }

        setJobNodes(prev => [...prev, ...newUi]);
        setTotalCount(prev => prev + newUi.length);
        pageRef.current = currentPage;
        setIsLoadMorePending(false);
        isFetchingMore.current = false;
      } else {
        // Reset seen IDs for fresh loads
        seenJobIds.current = new Set(response.jobIds || []);
        setJobNodes(response.ui);
        setTotalCount(response.count);
        setIsLoading(false);
      }
      setLastFetchCount(response.count);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      savedScrollRef.current = null;
      setIsLoadMorePending(false);
      isFetchingMore.current = false;
      setIsLoading(false);
    }
  }, [q, companyId, remote, country, region, city, tags, sources, showClosed, sort, since, expMin, expMax]);

  // Fetch jobs on filter change (if not restored from cache)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (isCacheValid) return; // Already restored synchronously
      fetchJobs(false);
      return;
    }
    
    // On subsequent runs, ONLY fetch if the filter actually changed
    // This prevents double-fetching when nuqs syncs URL params on mount
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      fetchJobs(false);
    }
  }, [filterKey, fetchJobs, isCacheValid]);

  const hasMore = lastFetchCount === PAGE_SIZE;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore.current && !scrollJustRestored) {
          isFetchingMore.current = true;
          setIsLoadMorePending(true);
          fetchJobs(true);
        }
      },
      // rootMargin starts the fetch before the user reaches the exact bottom.
      { threshold: 0, rootMargin: "400px 0px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => observer.disconnect();
    // jobNodes and scrollJustRestored must be dependencies: IntersectionObserver only fires on
    // visibility *crossings*, so if the loader is still in view when a page
    // finishes loading or scroll restoration completes, it would never fire again.
    // Recreating the observer after these events makes observe() re-report the current intersection.
  }, [hasMore, isLoading, fetchJobs, jobNodes, scrollJustRestored]);

  // Track scroll position and prevent programmatic scroll resets during fetches
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      
      // If a programmatic reset to 0 happens while we have a saved scroll position,
      // restore it immediately instead of waiting for the fetch to complete.
      if (y < 50 && savedScrollRef.current !== null && savedScrollRef.current >= 150) {
        window.scrollTo({ top: savedScrollRef.current, behavior: "instant" });
        return;
      }
      
      if (y > 0 || scrollYRef.current < 150) {
        scrollYRef.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore scroll position after load-more to fix mobile scroll-to-top.
  // Next.js Server Actions can trigger a router cache refresh that resets
  // window.scrollY on real mobile devices but not in desktop DevTools emulation.
  useEffect(() => {
    if (savedScrollRef.current === null) return;
    const targetY = savedScrollRef.current;
    savedScrollRef.current = null;
    if (targetY < 150) return;

    // Only correct a Next.js router-cache flush (scrollY resets to ~0).
    // Don't interfere with intentional user scrolling (which moves away from
    // targetY but does NOT go back to 0). Stop watching after the first fix
    // so we never fight the user across multiple scroll events.
    let tid: any;

    const restore = () => {
      if (window.scrollY < 50) {
        window.scrollTo({ top: targetY, behavior: "instant" });
        window.removeEventListener("scroll", restore);
        clearTimeout(tid);
      }
    };

    restore();
    const rafId = requestAnimationFrame(restore);
    window.addEventListener("scroll", restore, { passive: true });
    tid = window.setTimeout(() => {
      window.removeEventListener("scroll", restore);
    }, 800);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(tid);
      window.removeEventListener("scroll", restore);
    };
  }, [jobNodes]);

  // Keep stateRef current after every render
  useEffect(() => {
    stateRef.current = { nodes: jobNodes, page: pageRef.current, scrollY: scrollYRef.current, filterKey, totalCount, lastFetchCount, seenIds: Array.from(seenJobIds.current) };
  });

  // Save to module cache on unmount (back-navigation will restore it)
  useEffect(() => {
    return () => {
      // Only overwrite scrollY in the cache if the ref is non-zero,
      // or if there was no previous cache. This prevents Strict Mode's
      // double-effect mount/unmount from overwriting a valid cache scroll with 0.
      const savedScroll = scrollYRef.current > 0 
        ? scrollYRef.current 
        : (feedCache ? feedCache.scrollY : 0);
        
      stateRef.current.scrollY = savedScroll;
      feedCache = { ...stateRef.current };
    };
  }, []);

  const searchLabel = q
    ? `for '${q}'`
    : companyId
    ? `at ${STATIC_COMPANIES.find(c => c.id === parseInt(companyId))?.name ?? `company ${companyId}`}`
    : "";

  return (
    <div className="flex-1 space-y-4">
      {/* Header with Categories and Sort */}
      <div className="flex flex-col gap-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" suppressHydrationWarning>
            {CATEGORIES.map((cat) => {
              // Prevent hydration mismatches by defaulting to 'All Jobs' on first render
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

        {/* Results count label */}
        {(q || companyId || remote || tags.length > 0 || sources.length > 0) && (
          <p className="text-sm">
            <span className="font-semibold text-emerald-400">
              {isLoading ? "..." : totalCount}
            </span>{" "}
            <span className="text-muted-foreground">
              result{totalCount !== 1 ? "s" : ""} {searchLabel}
            </span>
          </p>
        )}
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
      {restoredCount.current > 0 && (
        <style>{`
          .job-feed-list > :nth-child(-n+${restoredCount.current}) {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      )}
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
              No jobs match these filters
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground/70">
              Try a broader search term, or clear everything and start fresh.
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-5 py-2 text-sm font-medium text-emerald-400 transition-[transform,border-color,background-color] duration-150 hover:border-emerald-500/50 hover:bg-emerald-500/12 active:scale-[0.97]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Infinite Scroll Loader */}
      {hasMore && !isLoading && (
        <div ref={loaderRef} className="space-y-3 py-2" aria-busy={isLoadMorePending}>
          {isLoadMorePending &&
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/50 p-5"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-11 w-11 rounded-lg bg-secondary/80" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-[40%] bg-secondary/80" />
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Skeleton className="h-4 w-[20%] bg-secondary/80" />
                      <Skeleton className="h-4 w-[25%] bg-secondary/80" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
