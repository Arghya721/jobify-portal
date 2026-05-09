"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { StaticCompany } from "@/lib/companies-static";

interface CompanyGridProps {
  companies: StaticCompany[];
}

// Deterministic color from company name — avoids random flicker on re-render
function getAvatarColor(name: string): string {
  const PALETTE = [
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "bg-blue-500/15 text-blue-400 border-blue-500/20",
    "bg-violet-500/15 text-violet-400 border-violet-500/20",
    "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "bg-rose-500/15 text-rose-400 border-rose-500/20",
    "bg-teal-500/15 text-teal-400 border-teal-500/20",
    "bg-orange-500/15 text-orange-400 border-orange-500/20",
    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function CompanyCard({ company, index }: { company: StaticCompany; index: number }) {
  const initials = company.name
    .split(/[\s&,_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const colorClass = getAvatarColor(company.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5), ease: "easeOut" }}
    >
      <Link
        href={`/jobs?company_id=${company.id}`}
        className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/30 hover:bg-card/80 hover:shadow-sm"
      >
        {/* Logo or initials avatar */}
        {company.logo ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-white/5 p-1.5">
            <Image
              src={company.logo}
              alt={company.name}
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-sm font-bold tracking-tight transition-colors duration-200 ${colorClass}`}
          >
            {initials || company.name[0]?.toUpperCase()}
          </div>
        )}

        {/* Name */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {company.name}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:-rotate-45 group-hover:text-emerald-400" />
      </Link>
    </motion.div>
  );
}

export function CompanyGrid({ companies }: CompanyGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  // Group filtered results alphabetically
  const grouped = useMemo(() => {
    const map = new Map<string, StaticCompany[]>();
    for (const company of filtered) {
      const letter = /^[A-Za-z]/.test(company.name)
        ? company.name[0].toUpperCase()
        : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(company);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies…"
          aria-label="Search companies"
          className="h-11 w-full rounded-lg border border-border/60 bg-secondary/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No companies match &ldquo;{query}&rdquo;
        </div>
      ) : query ? (
        // Flat grid when searching — no letter groups
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((company, i) => (
            <CompanyCard key={company.name} company={company} index={i} />
          ))}
        </div>
      ) : (
        // Alphabetical groups when not searching
        <div className="space-y-10">
          {grouped.map(([letter, group]) => (
            <section key={letter} aria-label={`Companies starting with ${letter}`}>
              <h2 className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground/50 uppercase">
                {letter}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.map((company, i) => (
                  <CompanyCard key={company.name} company={company} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
