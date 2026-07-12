import { Badge } from "@/components/ui/badge";
import { TrackedLink } from "@/components/analytics/tracked-link";

interface SkillTagLinksProps {
  tags: string[];
}

export function SkillTagLinks({ tags }: SkillTagLinksProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            asChild
            variant="secondary"
            className="rounded-md px-3 py-1 text-sm font-medium border border-transparent transition-colors duration-150 hover:border-emerald-500/40 hover:text-emerald-400"
          >
            <TrackedLink
              href={`/jobs?${new URLSearchParams({ tags: tag })}`}
              event="job_detail_skill_click"
              eventParams={{ tag }}
            >
              {tag}
            </TrackedLink>
          </Badge>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
        Click a skill to browse matching jobs
      </p>
    </>
  );
}
