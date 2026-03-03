"use server";

import { fetchJobs, fetchJobById } from "@/lib/api-server";
import { JobCard } from "@/components/search/job-card";

export async function fetchJobsAction(params: any) {
  const { data } = await fetchJobs(params);
  
  // Compute a global offset so keys are unique across pages (avoids duplicate-key errors
  // when the same job.id appears in overlapping pages).
  const pageNum = params.page || 1;
  const limit = params.limit || 10;
  const offset = (pageNum - 1) * limit;

  // Return the rendered UI components directly. This prevents Next.js from
  // serializing the raw JSON data back to the client, solving the scraping exposure.
  const ui = data.map((job: any, index: number) => (
    <JobCard key={`${job.id}-${offset + index}`} job={job} index={index} />
  ));

  return {
    ui,
    count: data.length,
  };
}

export async function fetchJobByIdAction(id: number) {
  return fetchJobById(id);
}
