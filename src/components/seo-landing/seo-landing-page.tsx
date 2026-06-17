import { Suspense } from "react";
import { JobFeed } from "@/components/search/job-feed";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { SearchOmnibar } from "@/components/search/search-omnibar";
import { MobileFilterSheet } from "@/components/search/mobile-filter-sheet";
import { CoOccurringSkills } from "@/components/seo-landing/stats/co-occurring-skills";
import { ExperienceDistributionChart } from "@/components/seo-landing/stats/experience-distribution";
import { PostingVelocityBlock } from "@/components/seo-landing/stats/posting-velocity";
import { TopCompanies } from "@/components/seo-landing/stats/top-companies";
import { RemoteBreakdownBlock } from "@/components/seo-landing/stats/remote-breakdown";
import { AtsBreakdownBlock } from "@/components/seo-landing/stats/ats-breakdown";
import { fetchStackStats } from "@/lib/api-server";
import type { SEOPage } from "@/config/seo-pages";

interface Props {
  page: SEOPage;
}

/**
 * Server component — renders the complete pSEO landing page for a given
 * SEOPage config entry. Stats are fetched at build time (revalidate: 86400).
 */
export async function SEOLandingPage({ page }: Props) {
  const stats = await fetchStackStats(page.tag);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        {/* Hero text */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-3">
            {page.title}
          </h1>
          <p className="text-base text-white/60 leading-relaxed">{page.heroCopy}</p>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PostingVelocityBlock tag={page.tag} velocity={stats.postingVelocity} />
            <RemoteBreakdownBlock breakdown={stats.remoteBreakdown} />
            <CoOccurringSkills tag={page.tag} skills={stats.coOccurringSkills} />
            <ExperienceDistributionChart distribution={stats.experienceDistribution} />
            <TopCompanies tag={page.tag} companies={stats.topCompanies} />
            <AtsBreakdownBlock breakdown={stats.atsBreakdown} />
          </div>
        )}

        {/* Job feed */}
        <Suspense>
          <div className="flex gap-6">
            <aside className="hidden lg:block w-72 shrink-0">
              <FilterSidebar savedFilters={[]} maxFilters={3} />
            </aside>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <SearchOmnibar />
                <MobileFilterSheet savedFilters={[]} maxFilters={3} />
              </div>
              <JobFeed />
            </div>
          </div>
        </Suspense>

        {/* FAQ section */}
        {page.faqs.length > 0 && (
          <section className="mt-16 max-w-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">
              Frequently asked questions
            </h2>
            <dl className="space-y-6">
              {page.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-base font-medium text-white/90 mb-1">
                    {faq.question}
                  </dt>
                  <dd className="text-sm text-white/60 leading-relaxed">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </>
  );
}
