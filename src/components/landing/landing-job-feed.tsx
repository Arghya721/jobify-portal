import { fetchJobs } from "@/lib/api-server";
import { LandingJobFeedClient } from "./landing-job-feed-client";

export async function LandingJobFeed() {
  // Fetch initial jobs for the landing page (e.g., limit to 10)
  const { data: initialJobs } = await fetchJobs({ limit: 10 });

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* Pass the server-fetched jobs to the client component for interactive filtering */}
      <LandingJobFeedClient initialJobs={initialJobs} />
    </section>
  );
}
