import { MetadataRoute } from "next";

const BASE_URL =
  process.env.AUTH_URL ||
  "https://jobify-portal-355605934376.asia-south1.run.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
