"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateNotificationSettingsAction } from "@/app/actions/notification-settings";

interface NotificationSettingsFormProps {
  initialTelegramId: string | null;
  initialDiscordId: string | null;
}

export function NotificationSettingsForm({
  initialTelegramId,
  initialDiscordId,
}: NotificationSettingsFormProps) {
  const [telegramId, setTelegramId] = useState(initialTelegramId || "");
  const [discordId, setDiscordId] = useState(initialDiscordId || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const { error } = await updateNotificationSettingsAction(
        telegramId.trim() || null,
        discordId.trim() || null
      );
      if (error) {
        setMessage({ type: "error", text: error });
      } else {
        setMessage({ type: "success", text: "Notification settings saved successfully!" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Telegram Setup */}
      <div className="p-6 border border-border/50 rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Send className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Telegram Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive instant alerts via Telegram</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm space-y-2 text-muted-foreground bg-secondary/50 p-4 rounded-md">
            <p><strong>How to get your Telegram Chat ID:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open Telegram and search for our bot: <strong className="text-foreground">@JobifyNotifierBot</strong></li>
              <li>Send the command <code className="bg-background px-1.5 py-0.5 rounded text-foreground">/id</code></li>
              <li>The bot will reply with your numeric Chat ID</li>
              <li>Paste the numeric ID below</li>
            </ol>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telegram Chat ID</label>
            <Input
              placeholder="e.g. 123456789"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Discord Setup */}
      <div className="p-6 border border-border/50 rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Discord Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive instant alerts via Discord DM</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm space-y-2 text-muted-foreground bg-secondary/50 p-4 rounded-md">
            <p><strong>How to get your Discord User ID:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Join the <a href="#" className="text-indigo-400 hover:underline">Jobify Community Discord Server</a></li>
              <li>Send a message in the bot channel or DM the bot with: <code className="bg-background px-1.5 py-0.5 rounded text-foreground">/id</code></li>
              <li>The bot will reply with your 18-digit numeric User ID</li>
              <li>Paste the 18-digit ID below</li>
            </ol>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Discord User ID</label>
            <Input
              placeholder="e.g. 1452392106038657034"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
}
