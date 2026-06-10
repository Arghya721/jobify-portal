import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/auth";
import { UserMenu } from "@/components/user-menu";
import { ForceLogout } from "@/components/force-logout";
import { BrandLogo } from "@/components/brand-logo";
import { MobileMenu } from "@/components/navbar-mobile-menu";
import { NavLinks } from "@/components/nav-links";

export async function Navbar() {
  const session = await auth();
  const sessionError = (session as { error?: string } | null)?.error;

  // If the backend refresh token died, gracefully force the user out
  if (sessionError === "RefreshAccessTokenError") {
    return (
      <>
        <ForceLogout />
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl" suppressHydrationWarning>
          <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6" suppressHydrationWarning>
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo className="h-8 w-8" priority />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Jobify
              </span>
            </Link>
          </div>
        </header>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl" suppressHydrationWarning>
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6" suppressHydrationWarning>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo className="h-8 w-8" priority />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Jobify
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <NavLinks
          links={[
            { href: "/jobs", label: "Jobs" },
            { href: "/companies", label: "Companies" },
            ...(session?.user
              ? [
                  { href: "/filters", label: "Saved Filters" },
                  { href: "/resume", label: "Resume" },
                ]
              : []),
          ]}
        />


        {/* Actions */}
        <div className="flex items-center gap-2">
          {session?.user && (
            <Link
              href="/settings/notifications"
              aria-label="Notification settings"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </Link>
          )}
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login" prefetch={false}>
              <Button size="sm" className="rounded-full font-medium">Log in</Button>
            </Link>
          )}
          <ModeToggle />
          <MobileMenu isLoggedIn={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
