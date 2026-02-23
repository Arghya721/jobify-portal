import { getJobsGrpc, getJobByIdGrpc } from "@/lib/grpc-client";

// This is a pure server-side function (NOT an action) that can be safely
// called from Server Components like the Landing Jobs Feed during build/render.
export async function fetchJobs(params: any = {}) {
  try {
    const response = await getJobsGrpc(params);
    
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 10 }
    };
  } catch (error) {
    console.error("Error fetching jobs via gRPC:", error);
    return { data: [], pagination: { page: 1, limit: 10 } };
  }
}

export async function fetchJobById(id: number) {
  try {
    const job = await getJobByIdGrpc(id);
    return job;
  } catch (error) {
    console.error(`Error fetching job ${id} via gRPC:`, error);
    return null;
  }
}
