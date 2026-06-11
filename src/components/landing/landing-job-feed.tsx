import { LandingJobFeedClient } from "./landing-job-feed-client";
import { TextReveal } from "@/components/motion/text-reveal";

export function LandingJobFeed() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24" aria-labelledby="landing-feed-heading">
      <div className="mb-10">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
          Fresh off the wire
        </p>
        <TextReveal
          as="h2"
          id="landing-feed-heading"
          onScroll
          text="Posted while you were reading this."
          className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        />
      </div>
      {/* We use an empty array here so the client component fetches on mount */}
      <LandingJobFeedClient initialJobs={[]} />
    </section>
  );
}
