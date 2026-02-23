"use client";

import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_OPTIONS = [
  { label: "Any time", key: "any" },
  { label: "Past 24h", key: "1d" },
  { label: "Past Week", key: "7d" },
  { label: "Past Month", key: "30d" },
] as const;

export function QuickToggles() {
  const [remote, setRemote] = useQueryState(
    "remote",
    parseAsBoolean.withDefault(false)
  );
  const [since, setSince] = useQueryState(
    "since",
    parseAsString.withDefault("")
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Remote Only Toggle */}
      <button
        onClick={() => setRemote(remote ? null : true)}
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
        onValueChange={(v) => setSince(v === "any" ? null : v)}
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

