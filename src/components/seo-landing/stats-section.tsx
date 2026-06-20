import { Radio, Zap } from "lucide-react";
import { CoOccurringSkills } from "@/components/seo-landing/stats/co-occurring-skills";
import { ExperienceDistributionChart } from "@/components/seo-landing/stats/experience-distribution";
import { PostingVelocityBlock } from "@/components/seo-landing/stats/posting-velocity";
import { TopCompanies } from "@/components/seo-landing/stats/top-companies";
import { RemoteBreakdownBlock } from "@/components/seo-landing/stats/remote-breakdown";
import { AtsBreakdownBlock } from "@/components/seo-landing/stats/ats-breakdown";
import { Reveal } from "@/components/seo-landing/reveal";
import { fetchStackStats } from "@/lib/api-server";
import { DEFAULT_CO_OCCURRING_TAGS, type SEOPage } from "@/config/seo-pages";

/**
 * Async stats block — rendered inside a <Suspense> boundary so the page shell
 * (hero, job feed, FAQ) streams immediately and never blocks on the backend
 * stats call. Resolves to chips + grid + live summary once data arrives.
 */
export async function StatsSection({ page }: { page: SEOPage }) {
  const stats = await fetchStackStats(
    page.tag,
    page.coOccurringTags ?? DEFAULT_CO_OCCURRING_TAGS
  );

  if (!stats) return null;

  const remotePct =
    stats.remoteBreakdown.total > 0
      ? Math.round((stats.remoteBreakdown.remote / stats.remoteBreakdown.total) * 100)
      : null;
  const topCompanyNames = stats.topCompanies.slice(0, 3).map((c) => c.name);
  const topSkills = stats.coOccurringSkills.slice(0, 3).map((s) => s.tag);
  const topAts = stats.atsBreakdown
    .slice(0, 2)
    .map((a) => a.source.charAt(0).toUpperCase() + a.source.slice(1));

  const highlights: { icon: typeof Zap; value: string; label: string }[] = [
    { icon: Zap, value: String(stats.postingVelocity.thisWeek), label: `new ${page.tag} roles this week` },
  ];
  if (remotePct !== null) highlights.push({ icon: Radio, value: `${remotePct}%`, label: "remote-friendly" });
  if (topSkills.length > 0) highlights.push({ icon: Zap, value: topSkills[0], label: `most paired with ${page.tag}` });

  const blocks = [
    <PostingVelocityBlock key="pv" tag={page.tag} velocity={stats.postingVelocity} />,
    <RemoteBreakdownBlock key="rb" breakdown={stats.remoteBreakdown} />,
    <CoOccurringSkills key="co" tag={page.tag} skills={stats.coOccurringSkills} />,
    <ExperienceDistributionChart key="ex" distribution={stats.experienceDistribution} />,
    <TopCompanies key="tc" tag={page.tag} companies={stats.topCompanies} />,
    <AtsBreakdownBlock key="ats" breakdown={stats.atsBreakdown} />,
  ];

  return (
    <>
      {/* Highlight chips */}
      {highlights.length > 0 && (
        <Reveal className="mb-10">
          <div className="flex flex-wrap gap-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 backdrop-blur-sm transition-colors duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
              >
                <h.icon className="h-4 w-4 text-emerald-400" />
                <span className="text-lg font-bold tabular-nums text-white">{h.value}</span>
                <span className="text-xs text-white/50">{h.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Stats grid */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, i) => (
          <Reveal key={i} delay={i * 70} className="h-full [&>*]:h-full">
            {block}
          </Reveal>
        ))}
      </div>

      {/* Live SEO summary */}
      {(topCompanyNames.length > 0 || topSkills.length > 0) && (
        <Reveal className="mb-12 max-w-3xl">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
              {page.tag} hiring, right now
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/60 sm:text-base">
              <p>
                Employers posted{" "}
                <strong className="font-semibold text-white">{stats.postingVelocity.thisWeek}</strong> new {page.tag}{" "}
                role{stats.postingVelocity.thisWeek === 1 ? "" : "s"} this week
                {topCompanyNames.length > 0 && (
                  <>
                    {" "}across companies like{" "}
                    <span className="text-white/80">{listToProse(topCompanyNames)}</span>
                  </>
                )}
                .
                {remotePct !== null && (
                  <>
                    {" "}Around{" "}
                    <strong className="font-semibold text-emerald-400">{remotePct}%</strong> of openings are
                    remote-friendly.
                  </>
                )}
              </p>
              {topSkills.length > 0 && (
                <p>
                  In {page.tag} job descriptions, the skills that appear most often alongside it are{" "}
                  <span className="text-white/80">{listToProse(topSkills)}</span> — a useful signal for what to
                  sharpen before you apply.
                </p>
              )}
              <p>
                Every listing on this page is pulled straight from company applicant-tracking systems
                {topAts.length > 0 && (
                  <> like <span className="text-white/80">{listToProse(topAts)}</span></>
                )}
                , so you apply at the source — not a delayed, duplicated aggregator repost.
              </p>
            </div>
          </section>
        </Reveal>
      )}
    </>
  );
}

/** Skeleton shown while StatsSection streams in. */
export function StatsSectionSkeleton() {
  return (
    <>
      <div className="mb-10 flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-11 w-44 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
    </>
  );
}

/** "A, B and C" — small prose joiner for SEO copy. */
function listToProse(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
