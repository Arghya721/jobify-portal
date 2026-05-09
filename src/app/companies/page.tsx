import { STATIC_COMPANIES } from "@/lib/companies-static";
import { CompanyGrid } from "@/components/companies/company-grid";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Browse Companies — Jobify",
  description:
    "Explore all companies hiring engineers on Jobify. Direct from source ATS — no recruiters, no spam.",
  keywords: [
    "engineering companies hiring",
    "tech companies jobs",
    "software developer employers",
    "ATS job board companies",
  ],
  openGraph: {
    title: "Browse Companies — Jobify",
    description: "Explore all companies hiring engineers. Direct from ATS.",
    url: "/companies",
  },
};

export default function CompaniesPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <Building2 className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.15em] text-emerald-400/70 uppercase">
            {STATIC_COMPANIES.length} companies
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Browse Companies
        </h1>
        <p className="mt-2 text-muted-foreground">
          All sourced directly from company ATS — no middlemen, no spam.
        </p>
      </div>

      <CompanyGrid companies={STATIC_COMPANIES} />
    </div>
  );
}
