"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, ListFilter, Sparkles } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { completeOnboardingAction } from "@/app/actions/onboarding";

const OPEN_DELAY_MS = 800;

// The backend flag is the source of truth, but it only reaches the browser when the
// NextAuth JWT is minted or refreshed. This local marker covers the gap so a reload
// right after finishing the tour doesn't replay it.
const STORAGE_KEY = "jobify:onboarding-completed";

// Lets anything on the page (currently the user menu) replay the tour without
// threading state through the layout or re-rendering the tree.
const OPEN_EVENT = "jobify:open-welcome-tour";

/**
 * Reopens the feature tour on demand. Safe to call from any client component.
 * Deferred a tick because the usual caller is a dropdown item: Radix restores
 * focus to the menu trigger as it closes, which would pull focus straight back
 * out of a dialog opened synchronously in the same cycle.
 */
export function openWelcomeTour() {
  setTimeout(() => window.dispatchEvent(new Event(OPEN_EVENT)), 0);
}

const STEPS = [
  {
    icon: Sparkles,
    eyebrow: "Step 1",
    title: "AI Resume Match",
    body: "Upload your resume once. Every job gets scored against your real skills and experience, so the feed sorts itself around what you can actually get.",
    cta: "Upload resume",
    href: "/resume",
  },
  {
    icon: ListFilter,
    eyebrow: "Step 2",
    title: "Saved Filters",
    body: "Dial in a search — stack, location, remote, experience — then save it. Your presets stay one click away instead of being rebuilt every visit.",
    cta: "Build a filter",
    href: "/jobs",
  },
  {
    icon: Bell,
    eyebrow: "Step 3",
    title: "Job Alerts",
    body: "Connect Telegram or Discord and new matches land in your chat the moment they post. No inbox, no digest, no recruiter spam.",
    cta: "Set up alerts",
    href: "/settings/notifications",
  },
] as const;

interface WelcomeTourProps {
  /** False for users who already finished it — they can still replay it manually. */
  autoStart?: boolean;
}

export function WelcomeTour({ autoStart = true }: WelcomeTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Manual replay from the user menu, available regardless of autoStart.
  useEffect(() => {
    const onOpen = () => {
      setStep(0);
      setOpen(true);
      sendGAEvent("event", "onboarding_tour_shown", { trigger: "manual" });
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!autoStart) return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // storage blocked — fall through and rely on the server flag alone
    }

    const timer = setTimeout(() => {
      setOpen(true);
      sendGAEvent("event", "onboarding_tour_shown", { trigger: "auto" });
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [autoStart]);

  /** Closing by any route — finish, skip, Esc, overlay — permanently retires the tour. */
  function finish(reason: "completed" | "dismissed") {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    sendGAEvent("event", "onboarding_tour_finished", { reason, step: step + 1 });
    void completeOnboardingAction();
  }

  function handleOpenChange(next: boolean) {
    if (!next) finish("dismissed");
  }

  const isLast = step === STEPS.length - 1;
  const { icon: Icon, eyebrow, title, body, cta, href } = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        // Same reason as the login prompt: avoid an unwanted focus ring on Skip.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        className="sm:max-w-md rounded-2xl border-border/60 bg-card/95 backdrop-blur-sm p-7"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
              {eyebrow} of {STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => finish("dismissed")}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip
            </button>
          </div>

          <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
            <Icon className="h-5 w-5 text-emerald-500" />
          </div>

          <DialogTitle className="mt-4 text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {body}
          </DialogDescription>
        </DialogHeader>

        <TrackedLink
          href={href}
          event="onboarding_tour_cta_click"
          eventParams={{ step: step + 1 }}
          onClick={() => finish("completed")}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-colors duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/10"
        >
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </TrackedLink>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-emerald-500" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? finish("completed") : setStep((s) => s + 1))}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
            >
              {isLast ? "Got it" : "Next"}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
