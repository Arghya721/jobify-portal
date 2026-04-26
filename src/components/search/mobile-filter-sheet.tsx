"use client";

import { SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "./filter-sidebar";

interface MobileFilterSheetProps {
  savedFilters?: { id: number; name: string; filters: Record<string, any>; created_at: string }[];
  maxFilters?: number;
}

export function MobileFilterSheet({ savedFilters = [], maxFilters = 3 }: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[320px] border-border bg-background p-0"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-semibold">Filters</SheetTitle>
          <SheetClose asChild>
            <button className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </SheetClose>
        </SheetHeader>
        <div className="overflow-y-auto px-5 py-4">
          <FilterSidebar savedFilters={savedFilters} maxFilters={maxFilters} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
