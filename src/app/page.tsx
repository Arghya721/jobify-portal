import { Hero } from "@/components/landing/hero";
import { JobTicker } from "@/components/landing/job-ticker";
import { LandingJobFeed } from "@/components/landing/landing-job-feed";
// import { CTASection } from "@/components/landing/cta-section"; // not yet implemented — needs email backend
import { Footer } from "@/components/landing/footer";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingPowerStrip } from "@/components/landing/landing-power-strip";
// import { TechStackSection } from "@/components/landing/tech-stack-section";
import { ManifestoSection } from "@/components/landing/manifesto-section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobify — Find Your Next Engineering Role",
  description:
    "Direct from source ATS. No recruiters. No spam. Search thousands of engineering jobs by tech stack, location, and more.",
  keywords: [
    "find engineering jobs",
    "software jobs no recruiter",
    "remote developer jobs",
    "ATS job board",
    "tech jobs direct",
    "engineering job search",
  ],
  openGraph: {
    title: "Jobify — Find Your Next Engineering Role",
    description: "Direct from source ATS. No recruiters. No spam. Search thousands of engineering jobs.",
    url: "/",
    images: [{ url: "/jobify-og-image.png", width: 1200, height: 630, alt: "Jobify — Find Your Next Engineering Role" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobify — Find Your Next Engineering Role",
    description: "Direct from source ATS. No recruiters. No spam.",
    images: ["/jobify-og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jobify",
  url: "https://jobify.run",
  description: "Direct from source ATS engineering job board. No recruiters. No spam.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://jobify.run/jobs?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <FeaturesSection />
      <JobTicker />
      <LandingJobFeed />
      <LandingPowerStrip />
      {/* <CTASection /> */}
      <ManifestoSection />
      <Footer />
    </>
  );
}
