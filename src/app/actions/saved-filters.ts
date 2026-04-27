"use server";

import { authFetch } from "@/lib/auth-fetch";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// ─────────────────── List ───────────────────
export async function getSavedFiltersAction(redirectToLogoutOn401: boolean = true) {
  try {
    const res = await authFetch(`/api/v1/filters`, {
      cache: "no-store",
      redirectToLogoutOn401,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const filters = await res.json();
    return { filters, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    // Returns empty on error or "Not authenticated"
    return { filters: [], error: e.message };
  }
}

// ─────────────────── Create ───────────────────
export async function createSavedFilterAction(
  name: string,
  filters: Record<string, any>
) {
  try {
    const res = await authFetch(`/api/v1/filters`, {
      method: "POST",
      body: JSON.stringify({ name, filters }),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { filter: null, error: msg };
    }
    const filter = await res.json();
    return { filter, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { filter: null, error: e.message };
  }
}

// ─────────────────── Update ───────────────────
export async function updateSavedFilterAction(
  id: number,
  data: {
    name?: string;
    filters?: Record<string, any>;
    is_notification_enabled?: boolean;
  }
) {
  try {
    const res = await authFetch(`/api/v1/filters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { filter: null, error: msg };
    }
    const filter = await res.json();
    return { filter, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { filter: null, error: e.message };
  }
}

// ─────────────────── Delete ───────────────────
export async function deleteSavedFilterAction(id: number) {
  try {
    const res = await authFetch(`/api/v1/filters/${id}`, {
      method: "DELETE",
    });
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
