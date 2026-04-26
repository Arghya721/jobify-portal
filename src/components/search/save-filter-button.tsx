"use client";

import { useState, useTransition } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsBoolean,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  createSavedFilterAction,
  deleteSavedFilterAction,
} from "@/app/actions/saved-filters";

interface SavedFilter {
  id: number;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}

interface SaveFilterButtonProps {
  savedFilters: SavedFilter[];
  maxFilters?: number;
}

// All query params used by the job search — managed as a single atomic unit
const FILTER_PARSERS = {
  q: parseAsString,
  company_id: parseAsString,
  remote: parseAsBoolean,
  country: parseAsString,
  region: parseAsString,
  city: parseAsString,
  tags: parseAsArrayOf(parseAsString),
  source: parseAsArrayOf(parseAsString),
  show_closed: parseAsBoolean,
  exp_min: parseAsInteger,
  exp_max: parseAsInteger,
};

export function SaveFilterButton({
  savedFilters: initial,
  maxFilters = 3,
}: SaveFilterButtonProps) {
  const [filters, setFilters] = useState<SavedFilter[]>(initial);
  const [saveOpen, setSaveOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Single source of truth for all query params ────────────────────
  const [currentParams, setCurrentParams] = useQueryStates(FILTER_PARSERS);

  const isAtLimit = filters.length >= maxFilters;

  // Capture only non-empty params as the "filter to save"
  const activeFilters: Record<string, any> = Object.fromEntries(
    Object.entries(currentParams).filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && v === "") return false;
      if (typeof v === "boolean" && v === false) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  );
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // ── Apply a saved filter (atomic update — no racing) ────────────────
  const applyFilter = (saved: Record<string, any>) => {
    setCurrentParams({
      q: saved.q ?? null,
      company_id: saved.company_id ?? null,
      remote: saved.remote ?? null,
      country: saved.country ?? null,
      region: saved.region ?? null,
      city: saved.city ?? null,
      tags: saved.tags ?? null,
      source: saved.source ?? null,
      show_closed: saved.show_closed ?? null,
      exp_min: saved.exp_min ?? null,
      exp_max: saved.exp_max ?? null,
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!filterName.trim()) { setError("Please enter a name."); return; }
    setError(null);
    startTransition(async () => {
      const { filter, error: err } = await createSavedFilterAction(
        filterName.trim(),
        activeFilters
      );
      if (err) {
        setError(err);
      } else if (filter) {
        setFilters((prev) => [filter, ...prev]);
        setFilterName("");
        setSaveOpen(false);
        // Success animation
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2200);
      }
    });
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const { error: err } = await deleteSavedFilterAction(id);
      if (!err) setFilters((prev) => prev.filter((f) => f.id !== id));
    });
  };

  return (
    <div className="rounded-lg border border-border/40 bg-secondary/10 p-2.5 space-y-2">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Filter Presets
        </span>
        <span className="text-[11px] text-muted-foreground/50">
          {filters.length}/{maxFilters}
        </span>
      </div>

      {/* Action row */}
      <div className="flex gap-1.5">
        {/* Load dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={filters.length === 0}
              className={cn(
                "h-8 flex-1 justify-between gap-1 border border-border/40 px-2 text-xs transition-all",
                filters.length === 0
                  ? "opacity-40 cursor-not-allowed"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <BookmarkCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                {filters.length === 0 ? "No presets" : "Load preset"}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 border-border bg-popover"
            align="start"
          >
            <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Click to apply
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {filters.map((f) => (
              <DropdownMenuItem
                key={f.id}
                className="flex items-center justify-between gap-2 group cursor-pointer text-xs py-2"
                onSelect={() => applyFilter(f.filters)}
              >
                <span className="truncate">{f.name}</span>
                <button
                  onClick={(e) => handleDelete(f.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 p-0.5 rounded"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save button — with success animation */}
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isAtLimit || !hasActiveFilters}
              title={
                isAtLimit
                  ? `Limit of ${maxFilters} reached. Delete one first.`
                  : !hasActiveFilters
                  ? "Set at least one filter to save"
                  : "Save current filters as a preset"
              }
              className={cn(
                "h-8 w-8 shrink-0 border border-border/40 p-0 transition-all duration-300",
                saveSuccess
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 scale-110"
                  : isAtLimit || !hasActiveFilters
                  ? "opacity-40 cursor-not-allowed text-muted-foreground"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
              )}
            >
              {saveSuccess ? (
                <CheckCircle2
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    saveSuccess && "scale-110"
                  )}
                />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-emerald-400" />
                Save Filter Preset
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground -mt-1">
              Saving{" "}
              <span className="font-medium text-foreground">
                {Object.keys(activeFilters).length} active filter
                {Object.keys(activeFilters).length !== 1 ? "s" : ""}
              </span>
            </p>
            <div className="flex flex-col gap-3">
              <Input
                placeholder='e.g. "Remote React Jobs"'
                value={filterName}
                onChange={(e) => {
                  setFilterName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="h-9 border-border/60 bg-secondary/30 text-sm"
                autoFocus
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending || !filterName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success flash message */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500",
          saveSuccess ? "max-h-8 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Filter preset saved!
        </p>
      </div>
    </div>
  );
}
