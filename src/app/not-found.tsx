import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export const metadata = {
  title: "Page not found — Jobify",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-6 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
        404 — Not found
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        This role has been filled.
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-sm text-muted-foreground sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist or has moved. The
        jobs haven&apos;t gone anywhere, though.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          <Search className="h-4 w-4" />
          Browse open roles
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-[transform,border-color,color] duration-150 hover:border-border hover:text-foreground active:scale-[0.97]"
        >
          Back to home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
