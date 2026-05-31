"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { ResumeUpload } from "@/app/actions/resume";
import { ResumeDropzone } from "@/components/resume/resume-dropzone";
import { AnalysisProgress } from "@/components/resume/analysis-progress";
import { ResumeCard } from "@/components/resume/resume-card";
import { cn } from "@/lib/utils";

interface ResumePageShellProps {
  initialUploads: ResumeUpload[];
  maxUploads: number;
}

type PageState = "idle" | "uploading" | "processing";

export function ResumePageShell({ initialUploads, maxUploads }: ResumePageShellProps) {
  const [uploads, setUploads] = useState<ResumeUpload[]>(initialUploads);
  const [pageState, setPageState] = useState<PageState>(() => {
    const active = initialUploads.find(
      (u) => u.status === "pending" || u.status === "processing"
    );
    return active ? "processing" : "idle";
  });
  const [activeUploadId, setActiveUploadId] = useState<number | null>(() => {
    const active = initialUploads.find(
      (u) => u.status === "pending" || u.status === "processing"
    );
    return active ? active.id : null;
  });
  const [, startTransition] = useTransition();

  const hasActiveProcessing = pageState === "uploading" || pageState === "processing";
  const slotsUsed = uploads.length;
  const slotsAvailable = maxUploads - slotsUsed;

  function handleUploadSubmitted(uploadId: number) {
    setActiveUploadId(uploadId);
    setPageState("processing");
    // Optimistically add a pending entry to the list
    const newEntry: ResumeUpload = {
      id: uploadId,
      file_name: "Resume",
      status: "pending",
      jobs_query: null,
      error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUploads((prev) => [newEntry, ...prev]);
  }

  function handleAnalysisComplete(uploadId: number, jobsQuery: any) {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === uploadId
          ? { ...u, status: "completed", jobs_query: jobsQuery, updated_at: new Date().toISOString() }
          : u
      )
    );
    setPageState("idle");
    setActiveUploadId(null);
  }

  function handleAnalysisFailed(uploadId: number, error: string) {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === uploadId
          ? { ...u, status: "failed", error, updated_at: new Date().toISOString() }
          : u
      )
    );
    setPageState("idle");
    setActiveUploadId(null);
  }

  function handleDeleted(uploadId: number) {
    startTransition(() => {
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Resume Analyser</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {slotsUsed} / {maxUploads} resume slots used
          </p>
        </div>
      </div>

      {/* Slot indicators */}
      <div className="flex gap-2">
        {Array.from({ length: maxUploads }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i < slotsUsed ? "bg-emerald-500" : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Analysis progress (shown when processing) */}
      {pageState === "processing" && activeUploadId && (
        <AnalysisProgress
          uploadId={activeUploadId}
          onComplete={handleAnalysisComplete}
          onFailed={handleAnalysisFailed}
        />
      )}

      {/* Upload dropzone (shown when idle and slots available) */}
      {pageState === "idle" && slotsAvailable > 0 && (
        <ResumeDropzone
          onSubmitted={handleUploadSubmitted}
          onUploading={() => setPageState("uploading")}
        />
      )}

      {/* Slot full message */}
      {pageState === "idle" && slotsAvailable === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            All {maxUploads} slots used. Delete a resume to upload a new one.
          </p>
        </div>
      )}

      {/* Resume cards */}
      {uploads.length === 0 && pageState === "idle" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No resumes uploaded yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Upload a PDF or TXT resume and AI will find matching jobs automatically.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {uploads.map((upload) => (
          <ResumeCard
            key={upload.id}
            upload={upload}
            onDeleted={handleDeleted}
          />
        ))}
      </div>
    </div>
  );
}
