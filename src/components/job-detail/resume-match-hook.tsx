import { Sparkles } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getResumeUploadsAction } from "@/app/actions/resume";
import { buildJobsUrl } from "@/lib/resume-to-filters";

interface ResumeMatchHookProps {
  isAuthed: boolean;
}

export async function ResumeMatchHook({ isAuthed }: ResumeMatchHookProps) {
  let href = `/login?next=${encodeURIComponent("/resume")}`;
  let label = "Try AI matching";
  let hasResume = false;

  if (isAuthed) {
    const { uploads } = await getResumeUploadsAction();
    const jobsQuery = uploads.find((u) => u.status === "completed")?.jobs_query ?? null;
    if (jobsQuery) {
      href = buildJobsUrl(jobsQuery);
      label = "See jobs matched to my resume";
      hasResume = true;
    } else {
      href = "/resume";
      label = "Upload your resume";
    }
  }

  return (
    <section className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-400">
          AI Match
        </span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        Skip the search — upload your resume and we auto-filter jobs that fit your stack and experience.
      </p>
      <TrackedLink
        href={href}
        event="job_detail_ai_resume_cta_click"
        eventParams={{ authed: isAuthed, has_resume: hasResume }}
        className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-violet-500/45 px-4 py-2 text-sm font-semibold text-violet-300 transition-all duration-200 hover:border-violet-400/65 hover:bg-violet-500/10 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {label}
      </TrackedLink>
    </section>
  );
}

export function HookCardSkeleton() {
  return (
    <div className="h-[150px] animate-pulse rounded-2xl border border-border/40 bg-card/40" />
  );
}
