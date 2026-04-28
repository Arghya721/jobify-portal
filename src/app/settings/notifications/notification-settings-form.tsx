"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);
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
              <li>Open Telegram and search for our bot: <a href="https://t.me/jobify71_bot" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><strong>@jobify71_bot</strong></a> (known as jobify)</li>
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
          <div className="h-10 w-10 bg-[#5865F2]/10 rounded-full flex items-center justify-center">
            <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
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
              <li>DM the bot: <span className="text-[#5865F2] font-semibold">Jobify#1486</span> with the command <code className="bg-background px-1.5 py-0.5 rounded text-foreground">/id</code></li>
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
