import { auth } from "@/auth";
import { redirect } from "next/navigation";

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:8080";

export interface AuthFetchOptions extends RequestInit {
  /** If true (default), a 401 response will trigger a hard redirect to /api/auth/logout */
  redirectToLogoutOn401?: boolean;
}

/**
 * A wrapper around native fetch that automatically injects the backend JWT
 * and intercepts 401 Unauthorized responses to force a hard logout.
 */
export async function authFetch(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { redirectToLogoutOn401 = true, ...fetchOptions } = options;
  const session = await auth();
  const token = (session as any)?.accessToken ?? null;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // If the backend rejects the token (e.g. session was revoked),
  // force a hard redirect to clear the local session and router cache
  // ONLY if this fetch was marked as strictly protected.
  if (res.status === 401) {
    if (redirectToLogoutOn401) {
      redirect("/api/auth/logout");
    } else {
      throw new Error("Session revoked or expired");
    }
  }

  return res;
}
