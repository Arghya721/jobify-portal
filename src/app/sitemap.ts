import { MetadataRoute } from "next";
import { fetchJobs } from "@/lib/api-server";
import { generateJobSlug } from "@/lib/utils";
import { SEO_STACK_PAGES, seoPagePath } from "@/config/seo-pages";

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

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${BASE_URL}/companies`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const seoPages = SEO_STACK_PAGES.map((page) => ({
    url: `${BASE_URL}${seoPagePath(page)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const jobPages = jobs.map(({ id, title, company, createdAt }) => ({
    url: `${BASE_URL}/jobs/${generateJobSlug({ id, title, company: { name: company } })}`,
    lastModified: createdAt ? new Date(createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...seoPages, ...jobPages];
}
