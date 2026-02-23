"use server";

import { fetchJobs, fetchJobById } from "@/lib/api-server";
import { JobCard } from "@/components/search/job-card";

export async function fetchJobsAction(params: any) {
  const { data } = await fetchJobs(params);
  
  // Return the rendered UI components directly. This prevents Next.js from
  // serializing the raw JSON data back to the client, solving the scraping exposure.
  const ui = data.map((job: any, index: number) => (
    <JobCard key={job.id} job={job} index={index} />
  ));

  return {
    ui,
    count: data.length,
  };
}

export async function fetchJobByIdAction(id: number) {
  return fetchJobById(id);
}
