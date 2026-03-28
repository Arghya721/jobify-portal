import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MapPin, Monitor, Smartphone, Clock, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevokeButton } from "./revoke-button";

function formatDeviceInfo(ua: string | undefined | null) {
  if (!ua) return "Unknown Device";
  
  let browser = "Web Browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  
  let os = "Unknown OS";
  let deviceModel = "";

  // Attempt to extract specific hardware models (especially for Android)
  // For example: Mozilla/5.0 (Linux; Android 13; SM-S918B Build/...) Extract -> SM-S918B
  const androidModelMatch = ua.match(/\(Linux;.*?Android.*?; ([a-zA-Z0-9\- ]+)(?: Build.*?)?\)/);
  if (androidModelMatch && androidModelMatch[1]) {
    const extracted = androidModelMatch[1].trim();
    // Chrome restricts User-Agents for privacy. 'K', 'wv' (WebView) means the model is intentionally hidden by the browser.
    if (extracted !== "K" && extracted.toLowerCase() !== "wv" && extracted.length > 2) {
      deviceModel = extracted;
    }
  }

  if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = deviceModel ? `Android (${deviceModel})` : "Android";
  else if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("iPad")) os = "iPad";
  else if (ua.includes("Linux")) os = "Linux";
  
  return deviceModel ? `${deviceModel} • ${browser}` : `${browser} on ${os}`;
}

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch Active Sessions from Backend
  const apiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/auth/sessions`, {
    headers: {
      Authorization: `Bearer ${(session as any).accessToken}`,
    },
    // Prevent Next.js from aggressively caching this for real-time updates
    cache: "no-store", 
  });

  const activeSessions = res.ok ? await res.json() : [];

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active login sessions across all devices. If you notice any unfamiliar activity, revoke access immediately.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {activeSessions.map((s: any) => {
          const isMobile = s.deviceInfo?.toLowerCase().includes("mobile") || s.deviceInfo?.toLowerCase().includes("android") || s.deviceInfo?.toLowerCase().includes("iphone");
          const DeviceIcon = isMobile ? Smartphone : Monitor;

          // Simple format for created/last used
          const createdAt = new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          const lastUsed = new Date(s.lastUsedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

          const readableDevice = formatDeviceInfo(s.deviceInfo);

          return (
            <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DeviceIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2" title={s.deviceInfo}>
                    {readableDevice}
                  </h3>
                  
                  <div className="flex flex-col mt-1 text-sm text-muted-foreground gap-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.location || "Unknown Location"} • {s.ipAddress || "Hidden IP"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Signed in: {createdAt} 
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground">
                  Last active: {lastUsed}
                </span>
                <RevokeButton tokenId={s.id} />
              </div>
            </div>
          );
        })}
        {activeSessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No active sessions found.
          </div>
        )}
      </div>
    </div>
  );
}
