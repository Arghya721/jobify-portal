import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNotificationSettingsAction } from "@/app/actions/notification-settings";
import { NotificationSettingsForm } from "./notification-settings-form";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { settings, error } = await getNotificationSettingsAction();

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure where you want to receive alerts for your saved job filters.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          Failed to load settings: {error}
        </div>
      )}

      <NotificationSettingsForm
        initialTelegramId={settings?.telegram_chat_id || null}
        initialDiscordId={settings?.discord_user_id || null}
      />
    </div>
  );
}
