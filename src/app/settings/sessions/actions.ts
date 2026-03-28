"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function revokeSessionAction(tokenId: number) {
  const session = await auth();
  if (!session?.user || !(session as any).accessToken) {
    return { success: false, message: "Unauthorized" };
  }

  const apiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
  
  try {
    const res = await fetch(`${apiUrl}/api/auth/sessions/${tokenId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${(session as any).accessToken}`,
      },
    });

    if (!res.ok) {
      return { success: false, message: "Failed to revoke session" };
    }

    // Tell Next.js to re-fetch the page data specifically for this route
    revalidatePath("/settings/sessions");
    return { success: true };
  } catch (error) {
    console.error("Error revoking session:", error);
    return { success: false, message: "Network error" };
  }
}
