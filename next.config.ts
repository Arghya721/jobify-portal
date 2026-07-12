import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // The job detail page now renders session-aware content (alerts / AI
        // match CTAs), so shared caches must never store it: a logged-in
        // user's HTML — including links derived from their resume — would be
        // served to everyone. Origin speed comes from the server-side job
        // cache in api-server.ts instead.
        source: "/jobs/:id",
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
