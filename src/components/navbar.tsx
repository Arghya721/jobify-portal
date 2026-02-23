"use client";

import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Jobify
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-white"
          >
            Jobs
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-white"
          >
            Companies
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-white"
          >
            Salary Insights
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
            Log in
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-white text-black font-medium hover:bg-white/90"
          >
            Post a Job
          </Button>
        </div>
      </div>
    </header>
  );
}
