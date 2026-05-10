"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookmarkCheck, Bell, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: BookmarkCheck,
    label: "Saved Filters",
    badge: "Up to 3 presets",
    description:
      "Pin your exact search — stack, location, remote. One click to restore. No re-configuring every visit.",
    href: "/filters",
    cta: "Manage filters",
  },
  {
    icon: Bell,
    label: "Job Alerts",
    badge: "Telegram · Discord",
    description:
      "Get a ping the moment a matching role posts. Connect your Telegram or Discord and stay ahead of every opening.",
    href: "/settings/notifications",
    cta: "Set up alerts",
  },
];

export function LandingPowerStrip() {
  return (
    <section
      className="relative py-16 md:py-20"
      aria-labelledby="power-strip-heading"
    >
      {/* Top divider */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase">
            Power features
          </p>
          <h2
            id="power-strip-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Work smarter, not harder.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              >
                <Link
                  href={feature.href}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-border/40 bg-card/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-card/80 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 transition-colors duration-300 group-hover:border-emerald-500/35 group-hover:bg-emerald-500/15">
                      <Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    </div>
                    <span className="rounded-full border border-border/50 bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground/70">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="mb-1.5 text-base font-semibold text-foreground">
                      {feature.label}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors duration-200 group-hover:text-emerald-300">
                    {feature.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
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
