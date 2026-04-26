import Link from "next/link";
import { Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
        {/* Links */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="#" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Cookies
          </Link>
        </div>

        {/* Social + Copyright */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <span className="text-xs text-muted-foreground/80">
            © 2026 Jobify Inc. Built for builders.
          </span>
        </div>
      </div>
    </footer>
  );
}
