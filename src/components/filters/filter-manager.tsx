"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Edit2, Loader2, Plus, Trash2, X, Check, AlertTriangle, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  deleteSavedFilterAction,
  updateSavedFilterAction,
} from "@/app/actions/saved-filters";

interface SavedFilter {
  id: number;
  name: string;
  filters: Record<string, any>;
  is_notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface FilterManagerProps {
  initialFilters: SavedFilter[];
  maxFilters: number;
}

/** Pretty-print a filters object as human-readable tags */
function FilterTags({ filters }: { filters: Record<string, any> }) {
  const entries = Object.entries(filters).filter(
    ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  );
  if (entries.length === 0)
    return <span className="text-xs text-muted-foreground/50">No filters set</span>;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {entries.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="text-[11px] bg-secondary/60 text-muted-foreground border-border/40"
        >
          {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
        </Badge>
      ))}
    </div>
  );
}

export function FilterManager({ initialFilters, maxFilters }: FilterManagerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<SavedFilter[]>(initialFilters);
  const [isPending, startTransition] = useTransition();

  // ── Edit state ─────────────────────────────────────────
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = (f: SavedFilter) => {
    setEditId(f.id);
    setEditName(f.name);
    setEditError(null);
  };

  const handleUpdate = () => {
    if (!editName.trim()) { setEditError("Name is required."); return; }
    const target = filters.find((f) => f.id === editId)!;
    startTransition(async () => {
      const { filter, error } = await updateSavedFilterAction(editId!, {
        name: editName.trim(),
        filters: target.filters
      });
      if (error) {
        setEditError(error);
      } else if (filter) {
        setFilters((prev) => prev.map((f) => (f.id === editId ? filter : f)));
        setEditId(null);
      }
    });
  };

  const handleToggleNotification = (f: SavedFilter) => {
    const newValue = !f.is_notification_enabled;
    // Optimistic update
    setFilters((prev) => prev.map((item) => (item.id === f.id ? { ...item, is_notification_enabled: newValue } : item)));
    
    startTransition(async () => {
      const { filter, error } = await updateSavedFilterAction(f.id, {
        is_notification_enabled: newValue
      });
      if (error) {
        // Revert on error
        setFilters((prev) => prev.map((item) => (item.id === f.id ? { ...item, is_notification_enabled: !newValue } : item)));
      } else if (filter) {
        setFilters((prev) => prev.map((item) => (item.id === f.id ? filter : item)));
      }
    });
  };

  // ── Delete with confirm dialog ─────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<SavedFilter | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const { error } = await deleteSavedFilterAction(id);
      if (!error) {
        setFilters((prev) => prev.filter((f) => f.id !== id));
      }
      setDeleteTarget(null);
    });
  };

  const remaining = maxFilters - filters.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Saved Filters</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filters.length} / {maxFilters} filter presets used
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/jobs")}
          className="gap-2 border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add from Jobs
        </Button>
      </div>

      {/* Slot indicators */}
      <div className="flex gap-2">
        {Array.from({ length: maxFilters }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i < filters.length ? "bg-emerald-500" : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Empty state */}
      {filters.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <Bookmark className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No saved filters yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Go to the Jobs page, apply filters and click &ldquo;Save&rdquo;.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 gap-2 text-xs border-border"
            onClick={() => router.push("/jobs")}
          >
            Browse Jobs
          </Button>
        </div>
      )}

      {/* Filter cards */}
      <div className="space-y-3">
        {filters.map((f) => (
          <div
            key={f.id}
            className="group rounded-xl border border-border/50 bg-card/60 p-4 transition-all hover:border-border"
          >
            {editId === f.id ? (
              /* ── Inline edit ── */
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setEditError(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                    if (e.key === "Escape") setEditId(null);
                  }}
                  className="h-8 flex-1 border-border/60 bg-secondary/30 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdate}
                  disabled={isPending}
                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditId(null)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
                {editError && <p className="text-xs text-destructive">{editError}</p>}
              </div>
            ) : (
              /* ── Display ── */
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-foreground">{f.name}</p>
                  <FilterTags filters={f.filters} />
                  <p className="mt-2 text-[11px] text-muted-foreground/50">
                    Saved {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 mr-3 px-2 border-r border-border/50">
                    <Switch
                      checked={f.is_notification_enabled}
                      onCheckedChange={() => handleToggleNotification(f)}
                      disabled={isPending}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      {f.is_notification_enabled ? (
                        <><Bell className="h-3 w-3 text-indigo-400" /> On</>
                      ) : (
                        <><BellOff className="h-3 w-3" /> Off</>
                      )}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(f)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Rename"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteTarget(f)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog (uses existing Dialog component) */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm border-border bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Delete filter?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &ldquo;<span className="font-medium text-foreground">{deleteTarget?.name}</span>&rdquo; will be
            permanently removed. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
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
    </div>
  );
}
