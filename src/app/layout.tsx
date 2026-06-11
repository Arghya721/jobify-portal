import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Navbar } from "@/components/navbar";
import { NavbarScrollWrapper } from "@/components/navbar-scroll-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewTransitionHandler } from "@/components/ui/transition-anchor";
import { SpotlightDelegate } from "@/components/motion/spotlight-delegate";
import { GoogleAnalytics } from "@next/third-parties/google";
import { auth } from "@/auth";
import { getResumeUploadsAction } from "@/app/actions/resume";
import { ResumeNotificationWatcher } from "@/components/resume/resume-notification-watcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let activeUploads: any[] = [];
  if (session?.user) {
    const { uploads } = await getResumeUploadsAction();
    activeUploads = uploads.filter(
      (u) => u.status === "pending" || u.status === "processing"
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased font-sans`}
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
            <SpotlightDelegate />
            {/* Persistent emerald atmosphere — fixed parallax layer behind all content */}
            <div aria-hidden="true" suppressHydrationWarning className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div className="orb-a absolute -left-[15%] top-[2%] h-[700px] w-[700px] rounded-full bg-emerald-500/[0.08] blur-[140px]" />
              <div className="orb-b absolute -right-[8%] top-[20%] h-[580px] w-[580px] rounded-full bg-emerald-400/[0.06] blur-[115px]" />
              <div className="orb-c absolute left-[22%] top-[45%] h-[500px] w-[500px] rounded-full bg-emerald-600/[0.045] blur-[105px]" />
              <div className="orb-d absolute -right-[10%] top-[63%] h-[640px] w-[640px] rounded-full bg-emerald-500/[0.065] blur-[130px]" />
              <div className="orb-e absolute -left-[8%] top-[82%] h-[540px] w-[540px] rounded-full bg-emerald-400/[0.05] blur-[115px]" />
            </div>
            {/* Film grain over everything — texture without weight */}
            <div aria-hidden="true" className="noise-overlay" />
            <NavbarScrollWrapper><Navbar /></NavbarScrollWrapper>
            {session?.user && activeUploads.length > 0 && (
              <ResumeNotificationWatcher initialUploads={activeUploads} />
            )}
            <main className="relative z-[1]">{children}</main>
          </NuqsAdapter>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-ZW94R7BR74" />
      </body>
    </html>
  );
}
