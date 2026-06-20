import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_SEO_PARAMS, findSeoPage, seoPagePath } from "@/config/seo-pages";
import { SEOLandingPage } from "@/components/seo-landing/seo-landing-page";

const SITE_URL = process.env.AUTH_URL || "https://jobify.run";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export function generateStaticParams() {
  // Pre-render every configured pSEO page under its own basePath.
  return ALL_SEO_PARAMS;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const seoPage = findSeoPage(category, slug);

  if (!seoPage) {
    return {
      title: "Page Not Found | Jobify",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}${seoPagePath(seoPage)}`;
  return {
    title: seoPage.title,
    description: seoPage.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: seoPage.title,
      description: seoPage.description,
      url,
      siteName: "Jobify",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryLandingPage({ params }: PageProps) {
  const { category, slug } = await params;
  const seoPage = findSeoPage(category, slug);

  if (!seoPage) notFound();

  return <SEOLandingPage page={seoPage} />;
}
