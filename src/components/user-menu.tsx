"use client";

import { useRouter } from "next/navigation";
import { Bell, Compass } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openWelcomeTour } from "@/components/onboarding/welcome-tour";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    sendGAEvent("event", "logout");
    window.location.href = "/api/auth/logout";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { sendGAEvent("event", "nav_click", { destination: "saved_filters" }); router.push("/filters"); }} className="cursor-pointer">
          Saved Filters
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { sendGAEvent("event", "nav_click", { destination: "notification_settings" }); router.push("/settings/notifications"); }} className="cursor-pointer">
          <Bell className="mr-2 h-3.5 w-3.5" />
          Notification Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { sendGAEvent("event", "nav_click", { destination: "active_sessions" }); router.push("/settings/sessions"); }} className="cursor-pointer">
          Active Sessions
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { sendGAEvent("event", "onboarding_tour_replay_click"); openWelcomeTour(); }}
          className="cursor-pointer"
        >
          <Compass className="mr-2 h-3.5 w-3.5" />
          Feature tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
