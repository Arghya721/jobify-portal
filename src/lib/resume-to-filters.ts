import { JobsQuery } from "@/app/actions/resume";

export function buildJobsUrl(query: JobsQuery): string {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.country) params.set("country", query.country);
  if (query.region) params.set("region", query.region);
  if (query.city) params.set("city", query.city);
  if (query.description_tags?.length)
    params.set("tags", query.description_tags.join(","));
  if (query.experience_min != null)
    params.set("exp_min", String(query.experience_min));
  if (query.experience_max != null)
    params.set("exp_max", String(query.experience_max));
  if (query.remote != null) params.set("remote", String(query.remote));

  return `/jobs?${params.toString()}`;
}
