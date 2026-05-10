"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Database, BookmarkCheck, Bell } from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  index: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}

const FEATURES: Feature[] = [
  {
    index: "01",
    icon: Database,
    title: "Direct from ATS",
    description:
      "Jobs pulled straight from company applicant tracking systems. No aggregator middlemen, no stale listings, no duplicate noise.",
  },
  {
    index: "02",
    icon: BookmarkCheck,
    title: "Saved Filters",
    description:
      "Save up to 3 filter presets — stack, location, remote status. Restore your exact search in one click. No re-configuring every session.",
    href: "/filters",
    cta: "Try it",
  },
  {
    index: "03",
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Connect Telegram or Discord. Get notified the moment a matching role posts — before the window closes on a fresh opening.",
    href: "/settings/notifications",
    cta: "Set up alerts",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 md:py-28" aria-labelledby="features-heading">
      {/* Top divider */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
            Why engineers choose Jobify
          </p>
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            No noise. No gatekeepers.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Just jobs.
            </span>
          </h2>
        </motion.div>

        {/* Feature cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-8 backdrop-blur-sm transition-colors duration-300 hover:border-emerald-500/30 hover:bg-card/80"
              >
                {/* Watermark index number */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -top-5 select-none font-mono text-[7rem] font-bold leading-none text-foreground/[0.035] transition-colors duration-300 group-hover:text-emerald-400/[0.055]"
                >
                  {feature.index}
                </span>

                {/* Icon badge */}
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 transition-colors duration-300 group-hover:border-emerald-500/35 group-hover:bg-emerald-500/15">
                  <Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </div>

                {/* Text */}
                <h3 className="mb-2.5 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* CTA link */}
                {feature.href && feature.cta && (
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    {feature.cta}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}

                {/* Bottom slide-in accent */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out group-hover:w-full"
                />
              </motion.article>
            );
          })}
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
