"use client";

import { sendGAEvent } from "@next/third-parties/google";

interface GAClickAreaProps {
  event: string;
  eventParams?: Record<string, string | number | boolean>;
  children: React.ReactNode;
  className?: string;
}

// Fires a GA event when any descendant link is clicked, without requiring the
// linked components themselves to be client components.
export function GAClickArea({ event, eventParams, children, className }: GAClickAreaProps) {
  return (
    <div
      className={className}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a")) {
          sendGAEvent("event", event, eventParams ?? {});
        }
      }}
    >
      {children}
    </div>
  );
}
