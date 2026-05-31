"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:8080";

async function getToken(): Promise<string> {
  const session = await auth();
  const token = (session as any)?.accessToken ?? null;
  if (!token) throw new Error("Not authenticated");
  return token;
}

// ─────────────────── Submit resume ───────────────────

export async function submitResumeAction(
  formData: FormData
): Promise<{ uploadId: number; status: string; error?: string }> {
  try {
    const token = await getToken();

    const res = await fetch(`${API_BASE}/api/v1/resume/analyse`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.status === 401) redirect("/api/auth/logout");

    if (res.status === 409) {
      const msg = await res.text();
      return { uploadId: 0, status: "error", error: msg };
    }

    if (!res.ok) {
      const msg = await res.text();
      return { uploadId: 0, status: "error", error: msg };
    }

    const data = await res.json();
    return { uploadId: data.upload_id, status: data.status };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { uploadId: 0, status: "error", error: e.message };
  }
}

// ─────────────────── List uploads ───────────────────

export async function getResumeUploadsAction(): Promise<{
  uploads: ResumeUpload[];
  error: string | null;
}> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/v1/resume/uploads`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) redirect("/api/auth/logout");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const uploads = await res.json();
    return { uploads, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { uploads: [], error: e.message };
  }
}

// ─────────────────── Delete upload ───────────────────

export async function deleteResumeUploadAction(
  id: number
): Promise<{ error: string | null }> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/v1/resume/uploads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) redirect("/api/auth/logout");
    if (res.status === 409) {
      const msg = await res.text();
      return { error: msg };
    }
    if (!res.ok) {
      const msg = await res.text();
      return { error: msg };
    }
    return { error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { error: e.message };
  }
}

// ─────────────────── Get download URL ───────────────────

export async function getResumeDownloadUrlAction(
  id: number
): Promise<{ url: string | null; error: string | null }> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/v1/resume/uploads/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) redirect("/api/auth/logout");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return { url: data.url, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { url: null, error: e.message };
  }
}

// ─────────────────── Types ───────────────────

export interface ResumeUpload {
  id: number;
  file_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  jobs_query: JobsQuery | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobsQuery {
  q: string;
  country?: string;
  city?: string;
  region?: string;
  remote?: boolean;
  description_tags?: string[];
  experience_min?: number;
  experience_max?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}
