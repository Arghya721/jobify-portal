import { MetadataRoute } from "next";
import { fetchJobs } from "@/lib/api-server";

const BASE_URL =
  process.env.AUTH_URL ||
  "https://jobify.run";

const PAGE_SIZE = 500;

async function fetchAllJobIds(): Promise<{ id: string; createdAt: string }[]> {
  const results: { id: string; createdAt: string }[] = [];
  let page = 1;

  while (true) {
    const { data } = await fetchJobs({ page, limit: PAGE_SIZE });
    if (!data || data.length === 0) break;
    for (const job of data) {
      results.push({ id: String(job.id), createdAt: job.created_at || "" });
    }
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchAllJobIds().catch(() => []);

  const jobEntries: MetadataRoute.Sitemap = jobs.map(({ id, createdAt }) => ({
    url: `${BASE_URL}/jobs/${id}`,
    lastModified: createdAt ? new Date(createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...jobEntries,
  ];
}
