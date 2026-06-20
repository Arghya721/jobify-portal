import "server-only";
import { getJobsGrpc, getJobByIdGrpc } from "@/lib/grpc-client";

// Pure server-side — safe to call from Server Components during build/render.
export async function fetchJobs(params: any = {}) {
  try {
    const response = await getJobsGrpc(params);
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 10 },
    };
  } catch (error) {
    console.error("Error fetching jobs via gRPC:", error);
    throw error;   // propagate so callers can show an error state, not empty results
  }
}

export async function fetchJobById(id: number | string) {
  try {
    const job = await getJobByIdGrpc(id);
    return job;
  } catch (error) {
    console.error(`Error fetching job ${id} via gRPC:`, error);
    return null;
  }
}

// ─── Stats types ─────────────────────────────────────────────────────────────

export interface CoOccurringSkill {
  tag: string;
  mentions: number;
  pct: number;
}

export interface ExperienceDistribution {
  band: string;
  count: number;
}

export interface PostingVelocity {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
}

export interface TopCompany {
  name: string;
  openRoles: number;
}

export interface RemoteBreakdown {
  remote: number;
  onsite: number;
  total: number;
}

export interface AtsBreakdown {
  source: string;
  count: number;
}

export interface StackStats {
  tag: string;
  totalJobs: number;
  coOccurringSkills: CoOccurringSkill[];
  experienceDistribution: ExperienceDistribution[];
  postingVelocity: PostingVelocity;
  topCompanies: TopCompany[];
  remoteBreakdown: RemoteBreakdown;
  atsBreakdown: AtsBreakdown[];
}

/**
 * Fetches stack stats from the public REST endpoint /api/v1/stats/stack.
 * Server-only (BACKEND_API_URL is never exposed to the client).
 * Next.js fetch cache revalidates every 24h to match Redis TTL.
 */
export async function fetchStackStats(
  tag: string,
  coOccurringTags?: string[]
): Promise<StackStats | null> {
  const baseUrl = process.env.BACKEND_API_URL;

  if (!baseUrl) {
    console.error("BACKEND_API_URL not configured");
    return null;
  }

  try {
    let url = `${baseUrl}/api/v1/stats/stack?tag=${encodeURIComponent(tag)}`;
    if (coOccurringTags && coOccurringTags.length > 0) {
      url += `&coOccurring=${encodeURIComponent(coOccurringTags.join(","))}`;
    }
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000), // fail fast if backend is down
    });

    if (!res.ok) {
      console.error(`Stats fetch failed for "${tag}": ${res.status}`);
      return null;
    }

    return res.json() as Promise<StackStats>;
  } catch (error) {
    console.error(`Error fetching stack stats for "${tag}":`, error);
    return null;
  }
}
