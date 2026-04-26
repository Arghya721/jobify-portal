"use client";

import { useState, useTransition } from "react";
import { useQueryState, parseAsString, parseAsBoolean, parseAsArrayOf, parseAsInteger } from "nuqs";
import { Bookmark, BookmarkCheck, ChevronDown, Loader2, Trash2 } from "lucide-react";
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
  getSavedFiltersAction,
  deleteSavedFilterAction,
} from "@/app/actions/saved-filters";
import { useRouter } from "next/navigation";

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

/** Reads the current URL search params as a plain object (filter values only). */
function useCurrentFilters() {
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [companyId] = useQueryState("company_id", parseAsString.withDefault(""));
  const [remote] = useQueryState("remote", parseAsBoolean.withDefault(false));
  const [country] = useQueryState("country", parseAsString.withDefault(""));
  const [region] = useQueryState("region", parseAsString.withDefault(""));
  const [city] = useQueryState("city", parseAsString.withDefault(""));
  const [tags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));
  const [sources] = useQueryState("source", parseAsArrayOf(parseAsString).withDefault([]));
  const [showClosed] = useQueryState("show_closed", parseAsBoolean.withDefault(false));
  const [expMin] = useQueryState("exp_min", parseAsInteger);
  const [expMax] = useQueryState("exp_max", parseAsInteger);

  const filters: Record<string, any> = {};
  if (q) filters.q = q;
  if (companyId) filters.company_id = companyId;
  if (remote) filters.remote = remote;
  if (country) filters.country = country;
  if (region) filters.region = region;
  if (city) filters.city = city;
  if (tags.length > 0) filters.tags = tags;
  if (sources.length > 0) filters.source = sources;
  if (showClosed) filters.show_closed = showClosed;
  if (expMin != null) filters.exp_min = expMin;
  if (expMax != null) filters.exp_max = expMax;

  return filters;
}

// ─── Apply filter: push each param into the URL ───────────────────────────────
function useApplyFilter() {
  const [, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [, setCompanyId] = useQueryState("company_id", parseAsString.withDefault(""));
  const [, setRemote] = useQueryState("remote", parseAsBoolean.withDefault(false));
  const [, setCountry] = useQueryState("country", parseAsString.withDefault(""));
  const [, setRegion] = useQueryState("region", parseAsString.withDefault(""));
  const [, setCity] = useQueryState("city", parseAsString.withDefault(""));
  const [, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));
  const [, setSources] = useQueryState("source", parseAsArrayOf(parseAsString).withDefault([]));
  const [, setShowClosed] = useQueryState("show_closed", parseAsBoolean.withDefault(false));
  const [, setExpMin] = useQueryState("exp_min", parseAsInteger);
  const [, setExpMax] = useQueryState("exp_max", parseAsInteger);

  return (f: Record<string, any>) => {
    setQ(f.q ?? null);
    setCompanyId(f.company_id ?? null);
    setRemote(f.remote ?? null);
    setCountry(f.country ?? null);
    setRegion(f.region ?? null);
    setCity(f.city ?? null);
    setTags(f.tags ?? []);
    setSources(f.source ?? []);
    setShowClosed(f.show_closed ?? null);
    setExpMin(f.exp_min ?? null);
    setExpMax(f.exp_max ?? null);
  };
}

// ─── Main component ────────────────────────────────────────────────────────────
export function SaveFilterButton({ savedFilters: initial, maxFilters = 3 }: SaveFilterButtonProps) {
  const [filters, setFilters] = useState<SavedFilter[]>(initial);
  const [saveOpen, setSaveOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentFilters = useCurrentFilters();
  const applyFilter = useApplyFilter();
  const isAtLimit = filters.length >= maxFilters;
  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  // ── Save ─────────────────────────────────────────────
  const handleSave = () => {
    if (!filterName.trim()) { setError("Please enter a name."); return; }
    setError(null);
    startTransition(async () => {
      const { filter, error: err } = await createSavedFilterAction(filterName.trim(), currentFilters);
      if (err) {
        setError(err);
      } else if (filter) {
        setFilters((prev) => [filter, ...prev]);
        setFilterName("");
        setSaveOpen(false);
      }
    });
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = (id: number) => {
    startTransition(async () => {
      const { error: err } = await deleteSavedFilterAction(id);
      if (!err) {
        setFilters((prev) => prev.filter((f) => f.id !== id));
      }
    });
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      {/* Load / Apply dropdown */}
      {filters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 flex-1 justify-between gap-1 border border-border/40 bg-secondary/20 px-2 text-xs text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                Saved Filters
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-border bg-popover" align="start">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Apply a saved filter
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {filters.map((f) => (
              <DropdownMenuItem
                key={f.id}
                className="flex items-center justify-between gap-2 group cursor-pointer text-xs"
                onSelect={() => applyFilter(f.filters)}
              >
                <span className="truncate">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(f.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Save current filter */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isAtLimit || !hasActiveFilters}
            title={
              isAtLimit
                ? `Limit of ${maxFilters} saved filters reached`
                : !hasActiveFilters
                ? "Set at least one filter first"
                : "Save current filters"
            }
            className={cn(
              "h-7 gap-1 border border-border/40 px-2 text-xs transition-all",
              isAtLimit || !hasActiveFilters
                ? "cursor-not-allowed opacity-40"
                : "bg-secondary/20 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Bookmark className="h-3.5 w-3.5" />
            {filters.length === 0 && <span>Save</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm border-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-base">Save Current Filters</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <Input
              placeholder="e.g. Remote React Jobs"
              value={filterName}
              onChange={(e) => { setFilterName(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="h-9 border-border/60 bg-secondary/30 text-sm"
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending || !filterName.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
