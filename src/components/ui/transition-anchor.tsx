"use client";

import { useEffect, useTransition, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { viewTransitionResolver } from "@/lib/view-transition";

/**
 * Attaches a global click listener that intercepts anchors with
 * data-view-transition="true" and wraps the navigation in
 * document.startViewTransition.
 *
 * Uses useTransition and usePathname to safely await Next.js rendering
 * before completing the transition snapshot, preventing InvalidStateErrors.
 */
export function ViewTransitionHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const activeTransition = useRef<ViewTransition | null>(null);

  // Disable browser native scroll restoration globally for the application
  useEffect(() => {
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Resolve any pending transition (from link clicks or BackButton) when pathname changes
  useEffect(() => {
    if (viewTransitionResolver.current) {
      viewTransitionResolver.current();
      viewTransitionResolver.current = null;
    }
  }, [pathname]);

  // Next.js restores the previous scroll position on back/forward navigation.
  // `data-scroll-behavior="smooth"` only opts its push scroll-to-top out of
  // `html { scroll-behavior: smooth }`, not popstate restoration — so without
  // this the restore animates visibly. Force instant scrolling for a short
  // window around every popstate.
  useEffect(() => {
    let tid: number | undefined;
    const onPopState = () => {
      const html = document.documentElement;
      html.style.scrollBehavior = "auto";
      window.clearTimeout(tid);
      // Chrome defers native scroll restoration until the swapped-in page is
      // tall enough — observed up to ~2s after popstate — so keep the window
      // generous. Native user gestures ignore scroll-behavior, so this is
      // invisible unless a programmatic scroll happens in the window.
      tid = window.setTimeout(() => {
        html.style.scrollBehavior = "";
      }, 3000);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.clearTimeout(tid);
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Prefetch on hover/touch for any internal link. Deliberately uses the
  // default prefetch kind (AUTO), NOT "full": a full prefetch resolves every
  // Suspense boundary on the target route — including slow backend-dependent
  // ones like SimilarJobs — into one atomic cache entry before it's usable.
  // A real navigation that lands on an in-flight full-prefetch reuses that
  // same all-or-nothing promise instead of streaming, so the page shows
  // nothing at all until the slowest boundary resolves (observed: 40s+ block,
  // skeleton never appears). Default/AUTO prefetch can't do that — it never
  // eagerly resolves nested Suspense — so a plain click always gets a genuine
  // streamed navigation: fast shell first, skeletons fill in as they resolve.
  useEffect(() => {
    const prefetched = new Set<string>();
    const handlePrefetch = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target?.closest) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href.startsWith("//") ||
        href.startsWith("/api/") ||
        prefetched.has(href)
      )
        return;
      prefetched.add(href);
      router.prefetch(href);
    };
    document.addEventListener("mouseover", handlePrefetch, { passive: true });
    document.addEventListener("touchstart", handlePrefetch, { passive: true });
    return () => {
      document.removeEventListener("mouseover", handlePrefetch);
      document.removeEventListener("touchstart", handlePrefetch);
    };
  }, [router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modified clicks
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-view-transition]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;

      e.preventDefault(); // Always prevent default to avoid full page reload and preserve SPA state!

      const targetPathname = href.split("?")[0].split("#")[0];

      const doNavigate = () => {
        startTransition(() => {
          router.push(href);
        });
      };

      // If going to the same pathname or no VT support
      if (!document.startViewTransition || pathname === targetPathname) {
        doNavigate();
        return;
      }

      // If there's already an active transition, skip it and resolve any
      // stale promise so the browser can clean up before we start a new one.
      if (activeTransition.current) {
        try { activeTransition.current.skipTransition(); } catch {}
        activeTransition.current = null;
      }
      if (viewTransitionResolver.current) {
        viewTransitionResolver.current();
        viewTransitionResolver.current = null;
      }

      try {
        const transition = document.startViewTransition(() => {
          return new Promise<void>((resolve) => {
            viewTransitionResolver.current = resolve;
            doNavigate();
          });
        });

        activeTransition.current = transition;

        // Prevent unhandled promise rejections on ready state if aborted
        transition.ready.catch(() => {});

        // Clean up the ref once the transition completes (success or abort)
        transition.finished.then(() => {
          activeTransition.current = null;
        }).catch(() => {
          activeTransition.current = null;
          // Also resolve any dangling promise to prevent memory leaks
          if (viewTransitionResolver.current) {
            viewTransitionResolver.current();
            viewTransitionResolver.current = null;
          }
        });
      } catch {
        // startViewTransition threw synchronously — navigate without animation
        activeTransition.current = null;
        doNavigate();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [router, pathname]);

  return null;
}

