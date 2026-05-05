"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useTransition, useEffect, useRef } from "react";

export default function ViewTransitionLink({
  children,
  href,
  className,
  onClick,
  ...props
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const resolveTransition = useRef<(() => void) | null>(null);

  // When pathname changes, if we have a pending transition promise, resolve it
  // This tells the browser the DOM has updated and it can run the "after" snapshot
  useEffect(() => {
    if (resolveTransition.current) {
      resolveTransition.current();
      resolveTransition.current = null;
    }
  }, [pathname]);

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    // Ignore modified clicks (ctrl+click, etc)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const targetUrl = typeof href === "string" ? href : href.toString();
    
    // Extract pathname from targetUrl to compare
    const targetPathname = targetUrl.split("?")[0].split("#")[0];

    // If going to the exact same pathname or no VT support
    if (!document.startViewTransition || pathname === targetPathname) {
      return; // let standard Next.js Link handle it instantly
    }

    e.preventDefault();

    document.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        resolveTransition.current = resolve;
        startTransition(() => {
          router.push(targetUrl);
        });
      });
    });
  };

  return (
    <Link href={href} className={className} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
