import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 pt-12 pb-10 sm:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BrandLogo className="h-7 w-7" />
          Jobify
        </Link>

        {/* Links */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-foreground">
            Cookies
          </Link>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="text-xs text-muted-foreground/80">
            © 2026 Jobify Inc. Built for builders.
          </span>
        </div>
      </div>
    </footer>
  );
}
