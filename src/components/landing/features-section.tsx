"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Database, BookmarkCheck, Bell, ArrowRight, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TextReveal } from "@/components/motion/text-reveal";
import { useSpotlight } from "@/components/motion/use-spotlight";
import { cn } from "@/lib/utils";

interface Feature {
  index: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  /** bento span */
  wide?: boolean;
}

const FEATURES: Feature[] = [
  {
    index: "01",
    icon: Database,
    title: "Direct from ATS",
    description:
      "Jobs pulled straight from company applicant tracking systems. No aggregator middlemen, no stale listings, no duplicate noise. When a company opens a role, it lands here in the same sweep.",
    wide: true,
  },
  {
    index: "02",
    icon: BookmarkCheck,
    title: "Saved filters",
    description:
      "Save up to 3 filter presets — stack, location, remote status. Restore your exact search in one click.",
    href: "/filters",
    cta: "Try it",
  },
  {
    index: "03",
    icon: Bell,
    title: "Smart alerts",
    description:
      "Connect Telegram or Discord. Get pinged the moment a matching role posts — before the window closes.",
    href: "/settings/notifications",
    cta: "Set up alerts",
  },
  {
    index: "04",
    icon: FileText,
    title: "Resume analyser",
    description:
      "Upload your resume and AI extracts your role, skills, and location — then auto-fills the search filters instantly. From PDF to a tuned job feed in one drop, no manual input.",
    href: "/resume",
    cta: "Try it",
    wide: true,
  },
];

function TiltCard({
  children,
  className,
  onMouseMove: externalMove,
}: {
  children: React.ReactNode;
  className?: string;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [4, -4]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 300,
    damping: 30,
  });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    externalMove?.(e);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  const spotlight = useSpotlight();

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="features-heading">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        {/* Section header — left-aligned, editorial */}
        <div className="mb-16 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4 font-mono text-xs tracking-[0.2em] text-emerald-400/70 uppercase"
          >
            Why engineers choose Jobify
          </motion.p>
          <TextReveal
            as="h2"
            id="features-heading"
            onScroll
            text="No noise. No gatekeepers."
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
            className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="font-display italic font-normal text-emerald-400">
              Just jobs.
            </span>
          </motion.p>
        </div>

        {/* Asymmetric bento — wide cards break the equal-column monotony */}
        <div className="grid gap-4 md:grid-cols-3" style={{ perspective: "1200px" }}>
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.index}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.12, ease: [0.23, 1, 0.32, 1] }}
                className={cn(feature.wide && "md:col-span-2")}
              >
                <TiltCard
                  onMouseMove={spotlight}
                  className={cn(
                    "spotlight-card spotlight-border group relative h-full overflow-hidden rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:bg-card/80",
                    feature.wide ? "p-8 md:p-10" : "p-8"
                  )}
                >
                  {/* Watermark index */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-7 select-none font-mono text-[8.5rem] font-bold leading-none text-foreground/[0.035] transition-colors duration-500 group-hover:text-emerald-400/[0.07]"
                  >
                    {feature.index}
                  </span>

                  {/* Icon badge — nudges up on hover */}
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 transition-[transform,border-color,background-color] duration-300 group-hover:-translate-y-1 group-hover:border-emerald-500/35 group-hover:bg-emerald-500/15">
                    <Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-muted-foreground",
                      feature.wide && "max-w-lg text-[15px]"
                    )}
                  >
                    {feature.description}
                  </p>

                  {feature.href && feature.cta && (
                    <Link
                      href={feature.href}
                      className="group/cta mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors duration-150 hover:text-emerald-300"
                    >
                      {feature.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
                    </Link>
                  )}

                  {/* Bottom accent sweep */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out group-hover:w-full"
                  />
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
