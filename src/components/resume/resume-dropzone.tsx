"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitResumeAction } from "@/app/actions/resume";

interface ResumeDropzoneProps {
  onSubmitted: (uploadId: number) => void;
  onUploading: () => void;
}

const ACCEPTED = [".pdf", ".txt"];
const MAX_SIZE_MB = 10;

export function ResumeDropzone({ onSubmitted, onUploading }: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validateAndSet(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt"].includes(ext ?? "")) {
      setError("Only PDF and TXT files are accepted.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) validateAndSet(selected);
  }

  function handleSubmit() {
    if (!file || isPending) return;
    onUploading();

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await submitResumeAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFile(null);
      onSubmitted(result.uploadId);
    });
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-border/60 hover:border-border hover:bg-secondary/30"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground/60" />
        {file ? (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-foreground truncate max-w-[240px]">{file.name}</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">
              Drop your resume here, or <span className="text-emerald-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">PDF or TXT · Max {MAX_SIZE_MB} MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {file && !error && (
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            "Analyse Resume"
          )}
        </Button>
      )}
    </div>
  );
}
