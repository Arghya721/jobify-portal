"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ResumeUpload } from "@/app/actions/resume";

interface ResumeNotificationWatcherProps {
  initialUploads: ResumeUpload[];
}

export function ResumeNotificationWatcher({ initialUploads }: ResumeNotificationWatcherProps) {
  const pathname = usePathname();
  const esRef = useRef<EventSource | null>(null);
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const activeUpload = initialUploads.find(
      (u) => u.status === "pending" || u.status === "processing"
    );
    if (!activeUpload) return;

    // Request notification permission once
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Don't open a duplicate SSE if one is already open
    if (esRef.current) return;

    const es = new EventSource(`/api/resume/stream/${activeUpload.id}`);
    esRef.current = es;

    es.addEventListener("result", (e) => {
      try {
        const payload = JSON.parse(e.data);
        const uploadId = activeUpload.id;

        if (notifiedRef.current.has(uploadId)) return;
        notifiedRef.current.add(uploadId);

        // Only fire browser notification if user is NOT on the resume page
        if (!pathname.startsWith("/resume")) {
          if ("Notification" in window && Notification.permission === "granted") {
            if (payload.status === "completed") {
              const n = new Notification("Resume analysed!", {
                body: `Your resume matched ${payload.jobs_query?.q ?? "jobs"}. Click to apply filters.`,
                icon: "/jobify-icon.png",
              });
              n.onclick = () => {
                window.focus();
                window.location.href = "/resume";
              };
            } else if (payload.status === "failed") {
              new Notification("Resume analysis failed", {
                body: "There was a problem analysing your resume. Please try again.",
                icon: "/jobify-icon.png",
              });
            }
          }
        }
      } catch {
        // ignore parse errors
      }
      es.close();
      esRef.current = null;
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
    };

    return () => {
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
