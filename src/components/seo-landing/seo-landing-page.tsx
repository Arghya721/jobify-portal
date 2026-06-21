import { Suspense } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PseoJobFeed } from "@/components/seo-landing/pseo-job-feed";
import { Reveal } from "@/components/seo-landing/reveal";
import { StatsSection, StatsSectionSkeleton } from "@/components/seo-landing/stats-section";
import { SEO_NAV_LINKS, seoPagePath, type SEOPage } from "@/config/seo-pages";

interface Props {
  page: SEOPage;
}

const SITE_URL = process.env.AUTH_URL || "https://jobify.run";

/**
 * Server component — renders the pSEO landing page shell. The hero, job feed,
 * FAQ and JSON-LD render immediately; live stats stream in via <StatsSection>
 * behind a <Suspense> boundary, so the page never blocks on the backend.
 */
export async function SEOLandingPage({ page }: Props) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Jobs", item: `${SITE_URL}/jobs` },
      { "@type": "ListItem", position: 2, name: page.title, item: `${SITE_URL}${seoPagePath(page)}` },
    ],
  };

  const currentPath = seoPagePath(page);
  const otherStacks = SEO_NAV_LINKS.filter((l) => l.href !== currentPath);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="relative mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        {/* Ambient accent orbs behind the hero */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
          <div className="seo-orb absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[100px]" />
          <div
            className="seo-orb absolute left-1/2 -top-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-[110px]"
            style={{ animationDelay: "4s" }}
          />
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
            <li><a href="/jobs" className="transition-colors hover:text-emerald-400">Jobs</a></li>
            <li aria-hidden className="text-white/20">/</li>
            <li className="text-white/55">{page.tag}</li>
          </ol>
        </nav>

        {/* Hero — staggered reveals so each element cascades in */}
        <div className="mb-10 max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · sourced from company ATS
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {page.title}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {page.heroCopy}
            </p>
          </Reveal>
        </div>

        {/* Live stats — streamed; page never waits on the backend */}
        <Suspense fallback={<StatsSectionSkeleton />}>
          <StatsSection page={page} />
        </Suspense>

        {/* Job feed — pre-filtered by page tag, no sidebar */}
        <Suspense>
          <PseoJobFeed tag={page.tag} />
        </Suspense>

        {/* FAQ — native accordions, also emitted as FAQPage JSON-LD above */}
        {page.faqs.length > 0 && (
          <Reveal className="mt-16 max-w-3xl">
            <section>
              <h2 className="mb-6 text-xl font-semibold text-white sm:text-2xl">
                Frequently asked questions
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="seo-faq group py-1">
                    <summary className="flex items-center justify-between gap-4 py-4 text-base font-medium text-white/90 transition-colors hover:text-white">
                      {faq.question}
                      <ChevronDown className="seo-faq-chevron h-4 w-4 shrink-0 text-white/40" />
                    </summary>
                    <div className="seo-faq-body-wrap">
                      <div className="seo-faq-body-inner">
                        <p className="pb-4 text-sm leading-relaxed text-white/55">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* Sibling cross-links — discoverability + SEO interlinking */}
        {otherStacks.length > 0 && (
          <Reveal className="mt-16">
            <section>
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
                Explore other stacks
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {otherStacks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/70 transition-[transform,border-color,color] duration-150 ease-[var(--ease-out)] hover:border-emerald-500/40 hover:text-emerald-400 active:scale-[0.97]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </>
  );
}
