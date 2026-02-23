"use server";

import { getCompaniesGrpc } from "@/lib/grpc-client";

export async function fetchCompanies() {
  try {
    const response = await getCompaniesGrpc();
    return response.companies || [];
  } catch (error) {
    console.error("Error fetching companies via gRPC:", error);
    return [];
  }
}
