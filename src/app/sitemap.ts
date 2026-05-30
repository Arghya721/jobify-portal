import { MetadataRoute } from "next";
import { fetchJobs } from "@/lib/api-server";
import { generateJobSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.AUTH_URL || "https://jobify.run";
const GRPC_PAGE_SIZE = 500;

async function fetchRecentJobs(): Promise<{ id: string; title: string; company: string; createdAt: string }[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const results: { id: string; title: string; company: string; createdAt: string }[] = [];
  let page = 1;

  while (true) {
    const { data } = await fetchJobs({ page, limit: GRPC_PAGE_SIZE, since }).catch(() => ({ data: [] as any[] }));
    if (!data || data.length === 0) break;

    for (const job of data) {
      results.push({
        id: String(job.id),
        title: job.title || "",
        company: job.company?.name || "",
        createdAt: job.created_at || "",
      });
    }

    if (data.length < GRPC_PAGE_SIZE) break;
    page++;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchRecentJobs().catch(() => []);

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...jobs.map(({ id, title, company, createdAt }) => ({
      url: `${BASE_URL}/jobs/${generateJobSlug({ id, title, company: { name: company } })}`,
      lastModified: createdAt ? new Date(createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
