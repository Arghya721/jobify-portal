"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Trash2,
  ExternalLink,
  Briefcase,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ResumeUpload, getResumeDownloadUrlAction, deleteResumeUploadAction } from "@/app/actions/resume";
import { buildJobsUrl } from "@/lib/resume-to-filters";

interface ResumeCardProps {
  upload: ResumeUpload;
  onDeleted: (id: number) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
  processing: {
    label: "Analysing",
    icon: Loader2,
    className: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    spin: true,
  },
  completed: {
    label: "Analysed",
    icon: CheckCircle2,
    className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-destructive border-destructive/30 bg-destructive/10",
  },
};

export function ResumeCard({ upload, onDeleted }: ResumeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const config = STATUS_CONFIG[upload.status];
  const StatusIcon = config.icon;
  const isActive = upload.status === "pending" || upload.status === "processing";

  function handleViewResume() {
    setViewLoading(true);
    startTransition(async () => {
      const { url, error } = await getResumeDownloadUrlAction(upload.id);
      setViewLoading(false);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else if (error) alert(error);
    });
  }

  function handleSearchJobs() {
    if (!upload.jobs_query) return;
    router.push(buildJobsUrl(upload.jobs_query));
  }

  function confirmDelete() {
    startTransition(async () => {
      const { error } = await deleteResumeUploadAction(upload.id);
      if (error) {
        setDeleteError(error);
      } else {
        setShowDeleteDialog(false);
        onDeleted(upload.id);
      }
    });
  }

  return (
    <>
      <div className="group rounded-xl border border-border/50 bg-card/60 p-4 transition-all hover:border-border">
        <div className="flex items-start justify-between gap-3">
          {/* Left: info */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <p className="truncate text-sm font-medium text-foreground">{upload.file_name}</p>
            </div>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={cn("text-[11px] gap-1", config.className)}
            >
              <StatusIcon className={cn("h-3 w-3", (config as any).spin && "animate-spin")} />
              {config.label}
            </Badge>

            {/* Extracted query preview */}
            {upload.status === "completed" && upload.jobs_query && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="text-[11px] bg-secondary/60">
                  {upload.jobs_query.q}
                </Badge>
                {(upload.jobs_query.description_tags ?? []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] bg-secondary/60">
                    {tag}
                  </Badge>
                ))}
                {upload.jobs_query.country && (
                  <Badge variant="secondary" className="text-[11px] bg-secondary/60">
                    {upload.jobs_query.country}
                  </Badge>
                )}
              </div>
            )}

            {/* Error message */}
            {upload.status === "failed" && upload.error && (
              <p className="text-xs text-destructive mt-1 line-clamp-2">{upload.error}</p>
            )}

            <p className="text-[11px] text-muted-foreground/50">
              Uploaded {new Date(upload.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleViewResume}
              disabled={isPending || viewLoading}
              title="View resume"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {viewLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
            </Button>

            {upload.status === "completed" && upload.jobs_query && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSearchJobs}
                title="Search matching jobs"
                className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
              >
                <Briefcase className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isActive || isPending}
              title={isActive ? "Cannot delete while processing" : "Delete resume"}
              className="h-7 w-7 text-muted-foreground hover:text-destructive disabled:opacity-30"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(o) => { if (!o) { setShowDeleteDialog(false); setDeleteError(null); } }}>
        <DialogContent className="sm:max-w-sm border-border bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Delete resume?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &ldquo;<span className="font-medium text-foreground">{upload.file_name}</span>&rdquo; will be
            permanently removed. This frees up one slot.
          </p>
          {deleteError && (
            <p className="text-xs text-destructive">{deleteError}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => { setShowDeleteDialog(false); setDeleteError(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
