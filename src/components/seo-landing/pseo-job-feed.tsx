"use client";

import { useEffect } from "react";
import {
  useQueryState,
  parseAsArrayOf,
  parseAsString,
  parseAsBoolean,
} from "nuqs";
import { JobFeed } from "@/components/search/job-feed";

interface Props {
  /** Pre-set tag, e.g. "Python" */
  tag: string;
}

/**
 * Client wrapper used on pSEO landing pages.
 * On mount it forces the URL params to only the relevant tag so JobFeed
 * fetches pre-filtered results without any extra location or search state.
 */
export function PseoJobFeed({ tag }: Props) {
  const [, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));
  const [, setCountry] = useQueryState("country", parseAsString.withDefault(""));
  const [, setRegion] = useQueryState("region", parseAsString.withDefault(""));
  const [, setCity] = useQueryState("city", parseAsString.withDefault(""));
  const [, setRemote] = useQueryState("remote", parseAsBoolean.withDefault(false));
  const [, setQ] = useQueryState("q", parseAsString.withDefault(""));

  useEffect(() => {
    // Force the feed to always use just the stack tag; clear any stale state
    // that might have leaked in from SPA navigation from /jobs.
    setTags([tag]);
    setCountry("");
    setRegion("");
    setCity("");
    setRemote(false);
    setQ("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  return <JobFeed hideHeader />;
}
