import { BellRing, ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";

interface AlertsHookCardProps {
  tags: string[];
  isAuthed: boolean;
}

export function AlertsHookCard({ tags, isAuthed }: AlertsHookCardProps) {
  const alertUrl = tags.length
    ? `/jobs?${new URLSearchParams({ tags: tags.slice(0, 3).join(",") })}`
    : "/jobs";
  const ctaHref = isAuthed ? alertUrl : `/login?next=${encodeURIComponent(alertUrl)}`;

  return (
    <section className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
      <div className="flex items-center gap-2">
        <BellRing className="h-4 w-4 text-emerald-500" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
          Job Alerts
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">
        Never miss a role like this
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Save these skills as a filter preset and get new matches in Telegram or Discord.
        {!isAuthed && " Free — sign in with Google."}
      </p>
      <TrackedLink
        href={ctaHref}
        event="job_detail_alerts_cta_click"
        eventParams={{ authed: isAuthed }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-colors duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/10"
      >
        {isAuthed ? "Set up this alert" : "Sign in to get alerts"}
        <ArrowRight className="h-3.5 w-3.5" />
      </TrackedLink>
      {isAuthed && (
        <TrackedLink
          href="/filters"
          event="job_detail_alerts_manage_click"
          className="mt-3 block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Manage existing alerts →
        </TrackedLink>
      )}
    </section>
  );
}
