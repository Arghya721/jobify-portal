"use server";

import { auth } from "@/auth";

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:8080";

async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  return (session as any)?.accessToken ?? null;
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─────────────────── List ───────────────────
export async function getSavedFiltersAction() {
  const token = await getAccessToken();
  if (!token) return { filters: [], error: "Not authenticated" };

  try {
    const res = await fetch(`${API_BASE}/api/v1/filters`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const filters = await res.json();
    return { filters, error: null };
  } catch (e: any) {
    return { filters: [], error: e.message };
  }
}

// ─────────────────── Create ───────────────────
export async function createSavedFilterAction(
  name: string,
  filters: Record<string, any>
) {
  const token = await getAccessToken();
  if (!token) return { filter: null, error: "Not authenticated" };

  try {
    const res = await fetch(`${API_BASE}/api/v1/filters`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name, filters }),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { filter: null, error: msg };
    }
    const filter = await res.json();
    return { filter, error: null };
  } catch (e: any) {
    return { filter: null, error: e.message };
  }
}

// ─────────────────── Update ───────────────────
export async function updateSavedFilterAction(
  id: number,
  name: string,
  filters: Record<string, any>
) {
  const token = await getAccessToken();
  if (!token) return { filter: null, error: "Not authenticated" };

  try {
    const res = await fetch(`${API_BASE}/api/v1/filters/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ name, filters }),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { filter: null, error: msg };
    }
    const filter = await res.json();
    return { filter, error: null };
  } catch (e: any) {
    return { filter: null, error: e.message };
  }
}

// ─────────────────── Delete ───────────────────
export async function deleteSavedFilterAction(id: number) {
  const token = await getAccessToken();
  if (!token) return { error: "Not authenticated" };

  try {
    const res = await fetch(`${API_BASE}/api/v1/filters/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { error: msg };
    }
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}
