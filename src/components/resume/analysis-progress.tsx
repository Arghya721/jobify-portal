"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildJobsUrl } from "@/lib/resume-to-filters";
import { JobsQuery } from "@/app/actions/resume";

interface AnalysisProgressProps {
  uploadId: number;
  onComplete: (uploadId: number, jobsQuery: JobsQuery) => void;
  onFailed: (uploadId: number, error: string) => void;
}

const STEPS = [
  "Resume uploaded",
  "Reading your resume…",
  "Identifying your skills…",
  "Extracting experience & location…",
  "Building your job search…",
];

const STEP_INTERVAL_MS = 3500;

export function AnalysisProgress({ uploadId, onComplete, onFailed }: AnalysisProgressProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<"processing" | "done" | "failed" | "timeout">("processing");
  const [jobsQuery, setJobsQuery] = useState<JobsQuery | null>(null);
  const [failError, setFailError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Advance steps on a timer for visual progress
    stepTimerRef.current = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 2));
    }, STEP_INTERVAL_MS);

    // Open SSE stream through Next.js proxy route
    const es = new EventSource(`/api/resume/stream/${uploadId}`);
    esRef.current = es;

    es.addEventListener("result", (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.status === "completed") {
          clearInterval(stepTimerRef.current!);
          setCurrentStep(STEPS.length - 1);
          setJobsQuery(payload.jobs_query);
          setStatus("done");
          onComplete(uploadId, payload.jobs_query);
        } else if (payload.status === "failed") {
          clearInterval(stepTimerRef.current!);
          setFailError(payload.error ?? "Analysis failed. Please try again.");
          setStatus("failed");
          onFailed(uploadId, payload.error ?? "Analysis failed.");
        }
      } catch {
        // ignore parse errors
      }
      es.close();
    });

    es.onerror = () => {
      // SSE closed (timeout or disconnect) — don't show hard error
      clearInterval(stepTimerRef.current!);
      if (status === "processing") setStatus("timeout");
      es.close();
    };

    return () => {
      clearInterval(stepTimerRef.current!);
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  if (status === "failed") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm font-medium text-destructive">Analysis failed</p>
        </div>
        <p className="text-xs text-muted-foreground">{failError}</p>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-5">
        <p className="text-sm text-muted-foreground">
          Analysis is taking longer than expected. We'll notify you when it's done.
        </p>
      </div>
    );
  }

  if (status === "done" && jobsQuery) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-400">Resume analysed!</p>
        </div>
        <p className="text-xs text-muted-foreground">
          AI identified <span className="text-foreground font-medium">{jobsQuery.q}</span> with skills{" "}
          <span className="text-foreground font-medium">
            {(jobsQuery.description_tags ?? []).join(", ")}
          </span>.
        </p>
        <Button
          size="sm"
          onClick={() => router.push(buildJobsUrl(jobsQuery))}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Search Matching Jobs →
        </Button>
      </div>
    );
  }

  // Processing animation
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />
        <p className="text-sm font-medium text-foreground">Analysing your resume…</p>
      </div>
      <ol className="space-y-2.5">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={step} className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : active ? (
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm transition-colors",
                  done
                    ? "text-muted-foreground line-through"
                    : active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/40"
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
