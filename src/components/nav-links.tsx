"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  href: string;
  label: string;
}

export function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative text-sm font-medium transition-colors",
              isActive
                ? "text-foreground after:absolute after:-bottom-[19px] after:left-0 after:right-0 after:h-px after:bg-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
