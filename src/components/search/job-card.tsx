import { FileText, ExternalLink, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import companyLogos from "@/lib/company-logos.json";

interface JobCardProps {
  job: any; // We'll type this fully later
  index: number;
}

export function JobCard({ job, index }: JobCardProps) {
  // Use real data from the API response
  const experienceRaw = job.experience_raw || "";
  const isRemote = job.is_remote || false;
  const employmentType = isRemote ? "Remote" : "On-site";
  // Use actual posted date from the API response
  const postedAtStr = job.details?.job_posted_at || job.created_at || "";
  
  // Safe array fallback
  const tags: string[] = job.matched_tags || [];

  const companyName = job.company?.name;
  const logoUrl = companyName ? (companyLogos as Record<string, string>)[companyName] : undefined;

  return (
    <div
      className="job-card-enter group relative rounded-xl border border-border/50 bg-card/50 p-5 transition-all duration-200 hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-black/20"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Company Icon */}
        <div className="flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground relative">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${companyName} logo`} 
              className="h-full w-full object-cover p-1"
            />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title Row */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-foreground group-hover:text-foreground transition-colors">
              {job.title}
            </h3>
            {isRemote && (
              <Badge className="rounded-md bg-emerald-500/15 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border-0 px-2 py-0.5 hover:bg-emerald-500/20">
                Remote
              </Badge>
            )}
          </div>

          {/* Meta Row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {job.company?.name || "Company"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location_name || (isRemote ? "Remote" : "Unknown Location")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatPostedDate(postedAtStr)}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Salary + View */}
        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          <div className="text-right">
            {experienceRaw && (
              <p className="text-sm font-semibold text-foreground">
                {experienceRaw}
              </p>
            )}
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {employmentType}
            </p>
          </div>
          <a
            href={job.job_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary/60 hover:text-foreground"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Mobile salary + view */}
      <div className="mt-3 flex items-center justify-between sm:hidden">
        <div>
          {experienceRaw && (
            <span className="text-sm font-semibold text-foreground">
              {experienceRaw}
            </span>
          )}
          <span className="ml-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            {employmentType}
          </span>
        </div>
        <a
          href={job.job_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function formatPostedDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  // Java's OffsetDateTime.toString() can produce 7+ fractional second digits
  // (e.g. "2026-02-21T18:45:28.1725462"), but JS Date only handles up to 3 (ms).
  // Normalize to 3 decimal places.
  const normalized = dateStr.replace(/(\.\d{3})\d+/, "$1");
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  }

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (diffDays < 7) {
    return `${dayName} at ${timeStr}`;
  }

  return `${dayName}, ${monthDay} at ${timeStr}`;
}
