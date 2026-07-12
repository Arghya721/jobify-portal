import { notFound, redirect, permanentRedirect } from "next/navigation";
import { cache, Suspense } from "react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BackButton } from "@/components/ui/back-button";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  MapPin,
  XCircle,
  Sparkles,
} from "lucide-react";
import { fetchJobById as _fetchJobById } from "@/lib/api-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPANY_LOGOS as companyLogos, COMPANY_LOGOS_DARK as companyLogosDark } from "@/lib/companies-static";
import { extractIdFromSlug, generateJobSlug } from "@/lib/utils";
import { SEO_PAGES_BY_SLUG, seoPagePath } from "@/config/seo-pages";
import { auth } from "@/auth";
import { SkillTagLinks } from "@/components/job-detail/skill-tag-links";
import { AlertsHookCard } from "@/components/job-detail/alerts-hook-card";
import { ResumeMatchHook, HookCardSkeleton } from "@/components/job-detail/resume-match-hook";
import { SimilarJobs, SimilarJobsSkeleton } from "@/components/job-detail/similar-jobs";

// Deduplicate gRPC calls between generateMetadata and the page component
const fetchJobById = cache(_fetchJobById);

const SITE_URL = process.env.AUTH_URL || "https://jobify.run";

type JobLocation = {
  city?: { name?: string };
  region?: { name?: string; code?: string };
  country?: { name?: string; iso2?: string };
  is_remote?: boolean;
};

type JobDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  // pSEO slugs have moved off /jobs/* — this route 308-redirects them.
  // Point the canonical at the new location and keep the old URL out of the index.
  const seoPage = SEO_PAGES_BY_SLUG[slug];
  if (seoPage) {
    return {
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE_URL}${seoPagePath(seoPage)}` },
    };
  }

  const numericId = extractIdFromSlug(slug);

  if (!numericId) {
    return {
      title: "Job Not Found | Jobify",
      robots: { index: false, follow: false },
    };
  }

  const job = await fetchJobById(numericId);

  if (!job || !job.id) {
    return {
      title: "Job Not Found | Jobify",
      robots: { index: false, follow: false },
    };
  }

  const companyName = job.company?.name || "Company";
  const title = `${job.title} at ${companyName} | Jobify`;
  const rawDesc: string = job.details?.raw_description || "";
  const description = rawDesc.length > 155
    ? rawDesc.slice(0, 152).trim() + "..."
    : rawDesc || `${job.title} position at ${companyName}. ${job.location_name || "Remote"}. Apply now on Jobify.`;

  const pageUrl = `${SITE_URL}/jobs/${generateJobSlug(job)}`;
  const isRemote = hasRemoteLocation(job.locations || []);

  const keywords = [
    job.title,
    companyName,
    job.location_name,
    "job opening",
    "career",
    "hiring",
    isRemote ? "remote job" : null,
    isRemote ? "work from home" : null,
  ].filter(Boolean).join(", ");

  return {
    title,
    description,
    keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      title,
      description,
      url: pageUrl,
      siteName: "Jobify",
      images: [{ url: `${SITE_URL}/jobify-mark-dark.png`, width: 512, height: 512, alt: "Jobify" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${SITE_URL}/jobify-mark-dark.png`],
    },
    robots: {
      // Noindex closed jobs — they hurt CTR and waste crawl budget.
      // The page still renders (users can navigate back to it); Google just
      // won't show it in results once it re-crawls and sees this directive.
      index: job.is_active !== false,
      follow: true,
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;

  // pSEO slugs moved off /jobs/* — 308 redirect old /jobs/* URLs to /<category>/*.
  const seoPage = SEO_PAGES_BY_SLUG[slug];
  if (seoPage) {
    permanentRedirect(seoPagePath(seoPage));
  }

  const numericId = extractIdFromSlug(slug);

  if (!numericId) notFound();

  // Old numeric-only URL → 308 permanent redirect to canonical slug
  if (/^\d+$/.test(slug)) {
    const job = await fetchJobById(numericId);
    if (!job || !job.id) notFound();
    permanentRedirect(`/jobs/${generateJobSlug(job)}`);
  }

  const job = await fetchJobById(numericId);
  if (!job || !job.id) notFound();

  // Slug mismatch → 307 redirect to canonical (prevents duplicate content)
  const canonical = generateJobSlug(job);
  if (slug !== canonical) redirect(`/jobs/${canonical}`);

  const session = await auth();
  const isAuthed = !!session?.user;

  const companyName = job.company?.name || "Company";
  const logoUrl = companyLogos[companyName];
  const logoDarkUrl = companyLogosDark[companyName];
  const hasDarkVariant = logoUrl !== logoDarkUrl;
  const details = job.details || {};
  const postedAt = details.job_posted_at || "";
  const experience = details.experience_raw || formatExperience(details.experience_min, details.experience_max);
  const locations = buildLocationLabels(job.locations || []);
  const nonRemoteLocations = (job.locations || []).filter((l: JobLocation) => !l.is_remote);

  // validThrough: active jobs get datePosted+6mo; inactive jobs get datePosted (already closed)
  const validThrough = (() => {
    if (!postedAt) return undefined;
    if (!job.is_active) return postedAt;
    const posted = new Date(postedAt.replace(/(\.\d{3})\d+/, "$1"));
    if (isNaN(posted.getTime())) return undefined;
    const expiry = new Date(posted);
    expiry.setMonth(expiry.getMonth() + 6);
    return expiry.toISOString();
  })();

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    // identifier lets Google deduplicate this posting against the same job on other boards
    "identifier": {
      "@type": "PropertyValue",
      "name": "Jobify",
      "value": String(job.id),
    },
    "title": job.title,
    "description": details.description_html || details.raw_description || `${job.title} at ${companyName}`,
    "datePosted": postedAt || new Date().toISOString(),
    ...(validThrough ? { "validThrough": validThrough } : {}),
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
    },
    "directApply": !!job.job_url,
    ...(hasRemoteLocation(job.locations || [])
      ? {
          "jobLocationType": "TELECOMMUTE",
          // If the job has non-remote locations, use their country ISO2 codes as the
          // applicant location requirement (e.g. a "Remote – India" role will have
          // an office location with country.iso2 = "IN"). If there are no non-remote
          // locations the job is globally open, so we omit the field entirely —
          // Google treats its absence as "any country".
          ...(nonRemoteLocations.length > 0
            ? {
                "applicantLocationRequirements": nonRemoteLocations
                  .filter((l: JobLocation) => l.country?.iso2 || l.country?.name)
                  .map((l: JobLocation) => ({
                    "@type": "Country",
                    "name": l.country?.iso2 ?? l.country?.name,
                  })),
              }
            : {}),
        }
      : nonRemoteLocations.length > 0
      ? {
          "jobLocation": nonRemoteLocations.map((l: JobLocation) => ({
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              ...(l.city?.name ? { "addressLocality": l.city.name } : {}),
              ...(l.region?.name || l.region?.code ? { "addressRegion": l.region?.name || l.region?.code } : {}),
              ...(l.country?.iso2 ? { "addressCountry": l.country.iso2 } : {}),
            },
          })),
        }
      : job.location_name
      ? {
          "jobLocation": {
            "@type": "Place",
            "address": { "@type": "PostalAddress", "addressLocality": job.location_name },
          },
        }
      : {}),
    ...(details.experience_min != null
      ? { "experienceRequirements": { "@type": "OccupationalExperienceRequirements", "monthsOfExperience": details.experience_min * 12 } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <BackButton />

      {/* viewTransitionName links this container to the job card in the feed */}
      <div
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] rounded-3xl"
        style={{ viewTransitionName: `job-card-${numericId}` as any }}
      >
        <main className="min-w-0 space-y-6">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-border/60">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" style={{ pointerEvents: "none" }} />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/80 text-muted-foreground shadow-sm ring-1 ring-border/50">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt={`${companyName} logo`} className={`h-full w-full object-contain p-2${hasDarkVariant ? " dark:hidden" : ""}`} />
                    {hasDarkVariant && (
                      <img src={logoDarkUrl} alt={`${companyName} logo`} className="h-full w-full object-contain p-2 hidden dark:block" />
                    )}
                  </>
                ) : (
                  <Building2 className="h-8 w-8" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant={job.is_active ? "default" : "secondary"} className="rounded-md font-medium">
                    {job.is_active ? "Actively Hiring" : "Closed"}
                  </Badge>
                  {hasRemoteLocation(job.locations || []) && (
                    <Badge className="rounded-md border-0 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 font-medium tracking-wide">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Remote
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.1]">
                  {job.title || "Untitled role"}
                </h1>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-2 text-foreground/80">
                    <Building2 className="h-4 w-4 text-primary/70" />
                    {companyName}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-400/80" />
                    {job.location_name || locations[0] || "Location not listed"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-400/80" />
                    {formatPostedDate(postedAt)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:border-border/60">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-2">
              <FileTextIcon className="h-5 w-5 text-primary/80" />
              Job Description
            </h2>
            {details.description_html || details.raw_description ? (
              <div
                className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none break-words leading-relaxed text-muted-foreground/90 font-medium"
                dangerouslySetInnerHTML={{ __html: details.description_html || details.raw_description }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
                <FileTextIcon className="h-8 w-8 mb-3 opacity-50" />
                <p className="text-sm font-medium">
                  No description was provided for this job.
                </p>
              </div>
            )}
          </section>

          {/* Skills Section */}
          {details.tags && details.tags.length > 0 && (
            <section className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:border-border/60">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary/80" />
                Skills
              </h2>
              <SkillTagLinks tags={details.tags} />
            </section>
          )}

          <Suspense fallback={<SimilarJobsSkeleton />}>
            <SimilarJobs
              currentJobId={job.id}
              tags={details.tags || []}
              companyId={job.company?.id}
              companyName={companyName}
            />
          </Suspense>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
            <Button
              asChild
              className="w-full text-base font-semibold h-12 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
              disabled={!job.job_url}
              size="lg"
            >
              <a href={job.job_url || "#"} target="_blank" rel="noopener noreferrer">
                Apply for this role
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <div className="mt-8 space-y-5 text-sm">
              <DetailRow icon={<Briefcase className="h-4 w-4 text-blue-400" />} label="Experience Requirements" value={experience || "Not specified"} />
              <DetailRow icon={<Clock className="h-4 w-4 text-orange-400" />} label="Posted Date" value={formatPostedDate(postedAt)} />
              <DetailRow
                icon={job.is_active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                label="Application Status"
                value={job.is_active ? "Accepting Applications" : "Closed"}
              />
              <DetailRow icon={<Globe2 className="h-4 w-4 text-indigo-400" />} label="Source Platform" value={job.company?.source || "Direct"} />
            </div>
          </section>

          <AlertsHookCard tags={details.tags || []} isAuthed={isAuthed} />

          <Suspense fallback={<HookCardSkeleton />}>
            <ResumeMatchHook isAuthed={isAuthed} />
          </Suspense>

          <section className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Locations</h2>
            <div className="space-y-2.5">
              {(locations.length ? locations : [job.location_name || "Location not listed"]).map((location, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-foreground/90 font-medium transition-colors hover:bg-secondary/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400/80" />
                  <span>{location}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3.5 group">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/80 group-hover:bg-secondary transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function buildLocationLabels(locations: JobLocation[]) {
  return locations
    .map((location) => {
      if (location.is_remote) return "Remote";
      return [location.city?.name, location.region?.name || location.region?.code, location.country?.name || location.country?.iso2]
        .filter(Boolean)
        .join(", ");
    })
    .filter(Boolean);
}

function hasRemoteLocation(locations: JobLocation[]) {
  return locations.some((location) => location.is_remote);
}

function formatExperience(min?: number, max?: number) {
  if (min != null && max != null) return `${min}-${max} years`;
  if (min != null) return `${min}+ years`;
  if (max != null) return `Up to ${max} years`;
  return "";
}

function formatPostedDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const normalized = dateStr.replace(/(\.\d{3})\d+/, "$1");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
