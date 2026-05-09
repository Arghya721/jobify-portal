"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

const STACKS: { label: string; tags: string[] }[] = [
  {
    label: "Languages",
    tags: ["Python", "TypeScript", "Go", "Java", "Rust", "C++", "Ruby", "Kotlin", "Swift", "Scala", "PHP", "Elixir"],
  },
  {
    label: "Frontend",
    tags: ["React", "Next.js", "Vue", "Angular", "Svelte", "Tailwind CSS", "GraphQL"],
  },
  {
    label: "Backend",
    tags: ["Node.js", "Django", "FastAPI", "Spring Boot", "Rails", "Laravel", "gRPC", "REST"],
  },
  {
    label: "Infrastructure",
    tags: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
  },
  {
    label: "Data & ML",
    tags: ["PostgreSQL", "MongoDB", "Redis", "Kafka", "PyTorch", "TensorFlow", "Spark", "dbt"],
  },
];

function StackTag({ tag, index }: { tag: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.4) }}
    >
      <Link
        href={`/jobs?q=${encodeURIComponent(tag)}`}
        className="group inline-flex items-center rounded-lg border border-border/40 bg-card/50 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:border-emerald-500/35 hover:bg-emerald-500/8 hover:text-emerald-400"
      >
        {tag}
      </Link>
    </motion.div>
  );
}

export function TechStackSection() {
  return (
    <section
      className="relative border-t border-border/60 py-20 md:py-28"
      aria-labelledby="techstack-heading"
    >
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <span className="font-mono text-xs tracking-[0.18em] text-emerald-400/70 uppercase">
                Browse by technology
              </span>
            </div>
            <h2
              id="techstack-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Find roles matching your stack.
            </h2>
          </div>
          <Link
            href="/jobs"
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse all jobs →
          </Link>
        </motion.div>

        {/* Category groups */}
        <div className="space-y-8">
          {STACKS.map((group, gi) => (
            <div key={group.label}>
              <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.16em] text-muted-foreground/45 uppercase">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag, ti) => (
                  <StackTag key={tag} tag={tag} index={gi * 12 + ti} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
