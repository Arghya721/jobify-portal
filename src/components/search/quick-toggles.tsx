"use client";

import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Globe, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildJobsUrl } from "@/lib/resume-to-filters";
import type { JobsQuery } from "@/app/actions/resume";

const DATE_OPTIONS = [
  { label: "Any time", key: "any" },
  { label: "Past 24h", key: "1d" },
  { label: "Past Week", key: "7d" },
  { label: "Past Month", key: "30d" },
] as const;

interface QuickTogglesProps {
  resumeJobsQuery?: JobsQuery | null;
}

export function QuickToggles({ resumeJobsQuery }: QuickTogglesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [remote, setRemote] = useQueryState(
    "remote",
    parseAsBoolean.withDefault(false)
  );
  const [since, setSince] = useQueryState(
    "since",
    parseAsString.withDefault("")
  );
  const [aiActive, setAiActive] = useState(false);

  function handleAiToggle() {
    if (!resumeJobsQuery) {
      router.push("/resume");
      return;
    }
    if (aiActive) {
      // Clear all resume-applied params — go back to plain jobs
      router.push("/jobs");
      setAiActive(false);
    } else {
      sendGAEvent("event", "ai_resume_filter_applied");
      router.push(buildJobsUrl(resumeJobsQuery));
      setAiActive(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* AI Resume Filter Toggle */}
      <button
        onClick={handleAiToggle}
        title={resumeJobsQuery ? "Apply filters from your resume" : "Upload a resume to use AI filters"}
        style={!resumeJobsQuery && !aiActive ? {
          background: "linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(196,181,253,0.24) 40%, rgba(139,92,246,0.12) 100%)",
          backgroundSize: "200% auto",
          animation: "ai-shimmer 2.5s linear infinite",
        } : undefined}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
          aiActive
            ? "border-transparent bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_28px_rgba(139,92,246,0.6)] hover:shadow-[0_0_36px_rgba(139,92,246,0.75)]"
            : resumeJobsQuery
              ? "border-violet-500/50 bg-violet-500/10 text-violet-300 hover:border-violet-500/70 hover:bg-violet-500/20 hover:shadow-[0_0_18px_rgba(139,92,246,0.3)]"
              : "border-violet-500/45 text-violet-300 hover:border-violet-400/65 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
        }`}
      >
        <Sparkles className={`h-4 w-4 shrink-0 ${!aiActive && !resumeJobsQuery ? "animate-pulse" : ""}`} />
        <span>
          {aiActive ? "AI Matched" : resumeJobsQuery ? "Match My Resume" : "Match with AI"}
        </span>
        {!resumeJobsQuery && !aiActive && (
          <span className="rounded-full bg-violet-400/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
            Try
          </span>
        )}
        {resumeJobsQuery && !aiActive && (
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        )}
      </button>

      {/* Remote Only Toggle */}
      <button
        onClick={() => { sendGAEvent("event", "remote_toggle", { enabled: !remote }); setRemote(remote ? null : true); }}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          remote
            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80 hover:text-foreground"
        }`}
      >
        <Globe className="h-3.5 w-3.5" />
        Remote Only
      </button>

      {/* Date Posted Select */}
      <Select
        value={since || "any"}
        onValueChange={(v) => { sendGAEvent("event", "date_filter_change", { value: v }); setSince(v === "any" ? null : v); }}
      >
        <SelectTrigger className="w-[140px] rounded-full border-border bg-secondary/50 text-sm">
          <SelectValue placeholder="Any time" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {DATE_OPTIONS.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

