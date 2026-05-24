"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Briefcase,
  Building2,
  BookmarkCheck,
  Bell,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  isLoggedIn: boolean;
}

const PUBLIC_LINKS = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
];

const AUTH_LINKS = [
  { href: "/filters", label: "Saved Filters", icon: BookmarkCheck },
  { href: "/settings/notifications", label: "Notification Settings", icon: Bell },
  { href: "/settings/sessions", label: "Active Sessions", icon: ShieldCheck },
];

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-5">
          <span className="text-base font-semibold tracking-tight text-foreground">
            Jobify
          </span>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close menu">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile navigation">
          {/* Public links */}
          {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
            <SheetClose key={href} asChild>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </SheetClose>
          ))}

          {/* Auth-only links */}
          {isLoggedIn && (
            <>
              <div className="my-2 h-px bg-border/40" role="separator" />
              <p className="mb-1 px-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground/50 uppercase">
                My account
              </p>
              {AUTH_LINKS.map(({ href, label, icon: Icon }) => (
                <SheetClose key={href} asChild>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-emerald-400/80" aria-hidden="true" />
                    {label}
                  </Link>
                </SheetClose>
              ))}
            </>
          )}

          {/* Login CTA for guests */}
          {!isLoggedIn && (
            <>
              <div className="my-2 h-px bg-border/40" role="separator" />
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Log in
                </Link>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
