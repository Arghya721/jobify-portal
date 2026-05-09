import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/auth";
import { UserMenu } from "@/components/user-menu";
import { ForceLogout } from "@/components/force-logout";
import { BrandLogo } from "@/components/brand-logo";

export async function Navbar() {
  const session = await auth();
  const sessionError = (session as { error?: string } | null)?.error;

  // If the backend refresh token died, gracefully force the user out
  if (sessionError === "RefreshAccessTokenError") {
    return (
      <>
        <ForceLogout />
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo className="h-8 w-8" priority />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Jobify
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Jobs
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Companies
          </Link>
          {/* Salary Insights — not yet implemented
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Salary Insights
          </Link>
          */}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login" prefetch={false}>
              <Button size="sm" className="rounded-full font-medium">Log in</Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
