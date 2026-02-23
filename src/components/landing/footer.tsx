import Link from "next/link";
import { Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/40 bg-zinc-950">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
        {/* Links */}
        <div className="flex gap-6 text-sm text-zinc-500">
          <Link href="#" className="transition-colors hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-zinc-300">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-zinc-300">
            Cookies
          </Link>
        </div>

        {/* Social + Copyright */}
        <div className="flex items-center gap-4 text-zinc-500">
          <a href="#" className="transition-colors hover:text-zinc-300">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="transition-colors hover:text-zinc-300">
            <Github className="h-4 w-4" />
          </a>
          <span className="text-xs text-zinc-600">
            © 2024 Jobify Inc. Built for builders.
          </span>
        </div>
      </div>
    </footer>
  );
}
