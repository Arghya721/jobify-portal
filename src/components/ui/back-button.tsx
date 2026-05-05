"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { viewTransitionResolver } from "@/lib/view-transition";

export function BackButton({ fallback = "/jobs", className }: { fallback?: string; className?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleClick = () => {
    const navigate = () => {
      startTransition(() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      });
    };

    if (!document.startViewTransition) {
      navigate();
      return;
    }

    try {
      document.startViewTransition(() =>
        new Promise<void>((resolve) => {
          viewTransitionResolver.current = resolve;
          navigate();
        })
      );
    } catch {
      // Another transition still animating — navigate without animation
      navigate();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className ?? "mb-6 group transition-all hover:-translate-x-1"}
      onClick={handleClick}
    >
      <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Back to jobs
    </Button>
  );
}
