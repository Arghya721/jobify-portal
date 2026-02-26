"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "All Jobs",
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "AI/ML",
  "Mobile",
];

// Map the gRPC response type to a cleaner format for the UI
function LandingJobCard({ job, index }: { job: any; index: number }) {
  // Use mock data fallback for fields the backend might not have yet
  const salary = "$100k - $200k"; // Fallback salary for now
  const remote = job.locations?.some((l: any) => l.is_remote) || false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      viewport={{ once: true }}
      className={`group relative rounded-xl border bg-card/40 p-5 transition-all duration-200 hover:bg-card/70 border-border/60`}
    >
      <div className="flex items-center gap-4">
        {/* Company Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              {job.title}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground/70">{job.company?.name || "Company"}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location_name || (remote ? "Remote" : "Unknown Location")}
            </span>
          </div>
          
          {/* Tags */}
          {job.matched_tags && job.matched_tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {job.matched_tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Salary + Apply */}
        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground/90">{salary}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              FULL-TIME
            </p>
          </div>
        </div>

        <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/40 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground">
          Apply
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function LandingJobFeedClient({ initialJobs }: { initialJobs: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All Jobs");

  // In a real app, this would trigger a new fetch using the query param
  // For now, we'll just filter what we have locally or show all if "All Jobs"
  const filteredJobs = activeCategory === "All Jobs" 
    ? initialJobs 
    : initialJobs.filter((j: any) => j.title?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <>
      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "border-muted-foreground bg-secondary text-foreground"
                  : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/40 hover:text-foreground/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sort by:</span>
          <select className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border/50">
            <option>Newest First</option>
            <option>Highest Salary</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="mt-8 space-y-3">
        {filteredJobs && filteredJobs.length > 0 ? (
          filteredJobs.map((job: any, i: number) => (
            <LandingJobCard key={job.id} job={job} index={i} />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No jobs found matching your criteria.
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="mt-8 flex justify-center">
        <a
          href="/jobs"
          className="rounded-xl border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border/80 hover:bg-secondary/60 hover:text-foreground"
        >
          Explore All Opportunities
        </a>
      </div>
    </>
  );
}
