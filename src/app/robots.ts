import { MetadataRoute } from "next";

const BASE_URL =
  process.env.AUTH_URL ||
  "https://jobify.run";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/"],
    },
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-jobs.xml`,
    ],
  };
}
