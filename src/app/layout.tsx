import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewTransitionHandler } from "@/components/ui/transition-anchor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL || "https://jobify.run"),
  title: "Jobify — Find Your Next Role",
  description:
    "Search thousands of engineering jobs. Filter by tech stack, location, remote status, and more.",
  keywords: [
    "engineering jobs",
    "software developer jobs",
    "remote tech jobs",
    "ATS jobs",
    "no recruiter jobs",
    "software engineer jobs",
    "developer job board",
  ],
  openGraph: {
    type: "website",
    siteName: "Jobify",
    title: "Jobify — Find Your Next Role",
    description:
      "Search thousands of engineering jobs. Filter by tech stack, location, remote status, and more.",
    images: [{ url: "/jobify-og-image.png", width: 1200, height: 630, alt: "Jobify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobify — Find Your Next Role",
    description: "Search thousands of engineering jobs. Filter by tech stack, location, remote status, and more.",
    images: ["/jobify-og-image.png"],
  },
  icons: {
    icon: [
      { url: "/jobify-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/jobify-mark-dark.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/jobify-apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <ViewTransitionHandler />
            <Navbar />
            <main>{children}</main>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
