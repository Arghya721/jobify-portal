"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Bell, Sparkles, Briefcase } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackedLink } from "@/components/analytics/tracked-link";

const DELAY_MS = 2500;

// Snooze is per job page, not global: dismissing on one role keeps that role
// quiet for a day, but the next job the user opens still gets the prompt.
const STORAGE_KEY = "jobify:login-prompt-dismissed";
const SNOOZE_MS = 24 * 60 * 60 * 1000;

/** pathname -> dismissal timestamp, with expired entries pruned on every read. */
function readSnoozes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const cutoff = Date.now() - SNOOZE_MS;
    const fresh: Record<string, number> = {};
    for (const [path, ts] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof ts === "number" && ts > cutoff) fresh[path] = ts;
    }
    return fresh;
  } catch {
    // private mode / storage blocked / corrupt JSON — treat as never dismissed
    return {};
  }
}

const PERKS = [
  { icon: Bell, text: "Telegram & Discord alerts for roles like this one" },
  { icon: Sparkles, text: "AI resume matching scored against every job" },
  { icon: Briefcase, text: "Saved filters that keep working while you sleep" },
] as const;

export function LoginPromptDialog() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (readSnoozes()[pathname]) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sendGAEvent("event", "job_detail_login_prompt_shown", {});
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      try {
        // readSnoozes() drops expired paths, so this write also garbage-collects
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...readSnoozes(), [pathname]: Date.now() }),
        );
      } catch {
        // ignore
      }
      sendGAEvent("event", "job_detail_login_prompt_dismissed", {});
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // Radix focuses the first control on open, which trips :focus-visible and
        // paints a ring on "Maybe later". Focus the dialog itself instead — still
        // trapped and Esc-dismissable, just no ring on a control the user never chose.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        className="sm:max-w-md rounded-2xl border-border/60 bg-card/95 backdrop-blur-sm p-7"
      >
        <DialogHeader>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Free account
          </span>
          <DialogTitle className="mt-2 text-xl font-bold tracking-tight">
            Stop refreshing job boards
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Sign in with Google and Jobify does the searching for you.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-1 space-y-3">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Icon className="h-3.5 w-3.5 text-emerald-500" />
              </span>
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>

        <TrackedLink
          href={loginHref}
          event="job_detail_login_prompt_cta_click"
          onClick={() => setOpen(false)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          Continue with Google
          <ArrowRight className="h-3.5 w-3.5" />
        </TrackedLink>

        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className="text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
