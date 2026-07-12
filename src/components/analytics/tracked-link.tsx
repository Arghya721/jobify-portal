"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";

interface TrackedLinkProps extends React.ComponentProps<typeof Link> {
  event: string;
  eventParams?: Record<string, string | number | boolean>;
}

export function TrackedLink({ event, eventParams, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        sendGAEvent("event", event, eventParams ?? {});
        onClick?.(e);
      }}
    />
  );
}
