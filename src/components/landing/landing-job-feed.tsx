import { LandingJobFeedClient } from "./landing-job-feed-client";

export function LandingJobFeed() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* We use an empty array here so the client component fetches on mount */}
      <LandingJobFeedClient initialJobs={[]} />
    </section>
  );
}
