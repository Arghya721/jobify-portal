"use server";

import { authFetch } from "@/lib/auth-fetch";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Marks the first-login feature tour as seen for the current user.
 * Idempotent on the backend, so retries and double-clicks are harmless.
 */
export async function completeOnboardingAction() {
  try {
    const res = await authFetch(`/api/v1/onboarding/complete`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e.message };
  }
}
