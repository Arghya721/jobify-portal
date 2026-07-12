import { Skeleton } from "@/components/ui/skeleton";

// Route-level loading UI — Next.js shows this the instant navigation starts,
// before any data fetching begins, decoupling the perceived click response
// from how long the page's own data takes. Once the page's synchronous
// content is ready it replaces this; ResumeMatchHook still streams in behind
// its own nested skeleton after that.
export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      <Skeleton className="mb-6 h-8 w-28 rounded-full" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-4">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-7 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8 space-y-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </section>

          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-md" />
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="mt-8 space-y-5">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </section>
          <div className="h-[130px] animate-pulse rounded-2xl border border-border/40 bg-card/40" />
          <div className="h-[150px] animate-pulse rounded-2xl border border-border/40 bg-card/40" />
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm">
            <Skeleton className="h-4 w-24 rounded-md mb-4" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </section>
        </aside>
      </div>
    </div>
  );
}
