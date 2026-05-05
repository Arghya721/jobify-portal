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

  // Resolve any pending transition (from link clicks or BackButton) when pathname changes
  useEffect(() => {
    if (viewTransitionResolver.current) {
      viewTransitionResolver.current();
      viewTransitionResolver.current = null;
    }
  }, [pathname]);

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

