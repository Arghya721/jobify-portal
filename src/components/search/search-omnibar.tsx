"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

const COMPANY_SUGGESTIONS = [
  { id: "1", name: "Google", logo: "G" },
  { id: "2", name: "Meta", logo: "M" },
  { id: "3", name: "Netflix", logo: "N" },
  { id: "4", name: "Vercel", logo: "V" },
  { id: "5", name: "Stripe", logo: "S" },
];
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function SearchOmnibar() {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [, setCompanyId] = useQueryState(
    "company_id",
    parseAsString.withDefault("")
  );
  const [localValue, setLocalValue] = useState(q);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external q changes to local
  useEffect(() => {
    setLocalValue(q);
  }, [q]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value);
      setOpen(value.length > 0);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQ(value || null);
      }, 300);
    },
    [setQ]
  );

  const handleSelectCompany = useCallback(
    (companyId: string, companyName: string) => {
      setCompanyId(companyId);
      setLocalValue(companyName);
      setQ(null);
      setOpen(false);
    },
    [setCompanyId, setQ]
  );

  const handleSelectKeyword = useCallback(
    (keyword: string) => {
      setQ(keyword);
      setLocalValue(keyword);
      setCompanyId(null);
      setOpen(false);
    },
    [setQ, setCompanyId]
  );

  const filteredCompanies = COMPANY_SUGGESTIONS.filter((c) =>
    c.name.toLowerCase().includes(localValue.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => localValue.length > 0 && setOpen(true)}
          placeholder="Search by role, company, or technology..."
          className="h-14 w-full rounded-xl border border-border/60 bg-secondary/50 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      {open && localValue.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          <Command className="bg-transparent">
            <CommandList>
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
              {filteredCompanies.length > 0 && (
                <CommandGroup heading="Companies">
                  {filteredCompanies.slice(0, 4).map((company) => (
                    <CommandItem
                      key={company.id}
                      onSelect={() =>
                        handleSelectCompany(company.id, company.name)
                      }
                      className="cursor-pointer gap-3 px-4 py-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                        {company.name.charAt(0)}
                      </div>
                      <span className="text-sm">{company.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Company
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Search as keyword">
                <CommandItem
                  onSelect={() => handleSelectKeyword(localValue)}
                  className="cursor-pointer gap-3 px-4 py-2.5"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    &ldquo;{localValue}&rdquo;
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Keyword
                  </span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
