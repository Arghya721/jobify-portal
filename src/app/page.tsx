import { Hero } from "@/components/landing/hero";
import { JobTicker } from "@/components/landing/job-ticker";
import { LandingJobFeed } from "@/components/landing/landing-job-feed";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobify — Find Your Next Engineering Role",
  description:
    "Direct from source ATS. No recruiters. No spam. Search thousands of engineering jobs by tech stack, location, and more.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <JobTicker />
      <LandingJobFeed />
      <CTASection />
      <Footer />
    </>
  );
}
