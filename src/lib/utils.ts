import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateJobSlug(job: {
  id: number | string;
  title: string;
  company?: { name?: string } | null;
}): string {
  const titlePart = slugify(job.title || "job");
  const companyPart = slugify(job.company?.name || "");
  const parts = [titlePart, companyPart].filter(Boolean);
  return `${parts.join("-")}-${job.id}`;
}

export function extractIdFromSlug(slug: string): string | null {
  const last = slug.split("-").pop();
  return last && /^\d+$/.test(last) ? last : null;
}
