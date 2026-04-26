import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSavedFiltersAction } from "@/app/actions/saved-filters";
import { FilterManager } from "@/components/filters/filter-manager";

export const metadata = {
  title: "Saved Filters — Jobify",
  description: "Manage your saved job search filter presets.",
};

const MAX_FILTERS = 3;

export default async function FiltersPage() {
  // Require authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { filters } = await getSavedFiltersAction();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <FilterManager initialFilters={filters} maxFilters={MAX_FILTERS} />
    </div>
  );
}
