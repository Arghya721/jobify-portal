import "server-only";
import { getJobsGrpc, getJobByIdGrpc } from "@/lib/grpc-client";
import type { StackStats } from "@/lib/stats-types";

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
// Defined in stats-types.ts (no `server-only`) so client components can import
// them too. Re-exported here for back-compat with existing server imports.
export type {
  CoOccurringSkill,
  ExperienceDistribution,
  PostingVelocity,
  TopCompany,
  RemoteBreakdown,
  AtsBreakdown,
  StackStats,
} from "@/lib/stats-types";

/**
 * Fetches stack stats from the public REST endpoint /api/v1/stats/stack.
 * Server-only (BACKEND_API_URL is never exposed to the client).
 * No Next.js fetch caching — every call hits the backend, which serves from
 * its own Redis cache (24h TTL). Avoids stale .next/cache copies.
 */
export async function fetchStackStats(
  tag: string,
  coOccurringTags?: string[]
): Promise<StackStats | null> {
  const baseUrl = process.env.BACKEND_API_URL;

  if (!baseUrl) {
    console.warn("BACKEND_API_URL not configured — skipping stats");
    return null;
  }

  try {
    let url = `${baseUrl}/api/v1/stats/stack?tag=${encodeURIComponent(tag)}`;
    if (coOccurringTags && coOccurringTags.length > 0) {
      url += `&coOccurring=${encodeURIComponent(coOccurringTags.join(","))}`;
    }
    const res = await fetch(url, {
      cache: "no-store", // always hit backend; Redis handles caching there
      // Generous: a cold stats aggregation (many co-occurring tags) can take a
      // few seconds before the backend's Redis cache is warm. Stats are
      // non-critical, so we'd rather wait than blank the section.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // Expected-failure path — warn (not error) so it doesn't trip the Next
      // dev error overlay; the page renders fine without stats.
      console.warn(`Stats fetch failed for "${tag}": ${res.status}`);
      return null;
    }

    return res.json() as Promise<StackStats>;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`Stats unavailable for "${tag}": ${reason}`);
    return null;
  }
}
