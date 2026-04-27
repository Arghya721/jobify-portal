"use server";

import { authFetch } from "@/lib/auth-fetch";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function getNotificationSettingsAction() {
  try {
    const res = await authFetch(`/api/notifications/settings`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const settings = await res.json();
    return { settings, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { settings: null, error: e.message };
  }
}

export async function updateNotificationSettingsAction(
  telegram_chat_id: string | null,
  discord_user_id: string | null
) {
  try {
    const res = await authFetch(`/api/notifications/settings`, {
      method: "PUT",
      body: JSON.stringify({ telegram_chat_id, discord_user_id }),
    });
    if (!res.ok) {
      const msg = await res.text();
      return { settings: null, error: msg };
    }
    const settings = await res.json();
    return { settings, error: null };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return { settings: null, error: e.message };
  }
}
