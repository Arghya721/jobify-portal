import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Jobify",
  description: "How Jobify collects, uses, and protects your personal data.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "May 9, 2026";
const CONTACT_EMAIL = "privacy@jobify.run";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

const NAV_ITEMS = [
  { id: "what-we-collect",   label: "What we collect" },
  { id: "how-we-use",        label: "How we use it" },
  { id: "what-we-dont-do",   label: "What we don't do" },
  { id: "third-parties",     label: "Third-party services" },
  { id: "data-retention",    label: "Data retention" },
  { id: "your-rights",       label: "Your rights" },
  { id: "cookies",           label: "Cookies" },
  { id: "security",          label: "Security" },
  { id: "contact",           label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.15em] text-emerald-400/70 uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Jobify is a direct-from-ATS engineering job board. We collect only what
          we need to run the service. We do not sell your data. We do not share
          your profile with employers or recruiters.
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Sticky sidebar nav */}
        <aside className="hidden shrink-0 lg:block lg:w-52">
          <nav className="sticky top-24 space-y-1" aria-label="Privacy policy sections">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-12 border-t border-border/40 pt-1 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">

          <Section id="what-we-collect" title="1. What we collect">
            <p>We collect the minimum data required to operate Jobify:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Account data</span> — your email
                address and display name, provided via OAuth (Google). We never see
                or store your OAuth provider password.
              </li>
              <li>
                <span className="font-medium text-foreground">Session tokens</span> — short-lived
                tokens stored in secure, HTTP-only cookies to keep you logged in.
              </li>
              <li>
                <span className="font-medium text-foreground">Saved filters</span> — job search
                filters you choose to save for faster re-use.
              </li>
              <li>
                <span className="font-medium text-foreground">Notification preferences</span> — if
                you opt in, your Telegram chat ID or Discord webhook URL to deliver job alerts.
              </li>
              <li>
                <span className="font-medium text-foreground">Usage data</span> — search queries,
                job listing views, and basic interaction data used to improve the platform.
              </li>
              <li>
                <span className="font-medium text-foreground">Technical data</span> — IP address,
                browser type, device info, and server logs collected automatically on each request.
              </li>
            </ul>
            <p>We do not collect résumés, cover letters, salary history, or any sensitive personal information.</p>
          </Section>

          <Section id="how-we-use" title="2. How we use it">
            <ul className="ml-4 list-disc space-y-2">
              <li>Authenticate your account and maintain your session.</li>
              <li>Deliver job alert notifications via Telegram or Discord (only if you enable this).</li>
              <li>Restore your saved search filters across sessions.</li>
              <li>Diagnose errors and monitor platform performance.</li>
              <li>Improve search relevance and job feed quality.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not use your data for automated profiling, credit scoring, or any form of algorithmic screening.</p>
          </Section>

          <Section id="what-we-dont-do" title="3. What we don't do">
            <ul className="ml-4 list-disc space-y-2">
              <li>We do not sell your personal data to any third party.</li>
              <li>We do not share your profile, search history, or contact details with employers or recruiters.</li>
              <li>We do not run advertising tracking or third-party ad pixels on any page.</li>
              <li>We do not use your data to train AI or machine learning models.</li>
              <li>We do not send marketing emails — the only emails we send are authentication-related (e.g. sign-in links).</li>
            </ul>
          </Section>

          <Section id="third-parties" title="4. Third-party services">
            <p>Jobify uses the following third-party services to operate. Each has its own privacy policy:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Google OAuth</span> — used
                for sign-in only. We receive your email and name; we do not receive access to your
                Google Drive, email inbox repositories.
              </li>
              <li>
                <span className="font-medium text-foreground">Google Cloud Platform</span> — our
                backend infrastructure (Cloud Run, Cloud SQL) is hosted on GCP in the
                asia-south1 region.
              </li>
              <li>
                <span className="font-medium text-foreground">Telegram Bot API</span> — if you enable
                Telegram notifications, your Telegram chat ID is stored and used solely to
                deliver job alerts. You can revoke access at any time in Settings.
              </li>
              <li>
                <span className="font-medium text-foreground">Discord Webhooks</span> — if you enable
                Discord notifications, your webhook URL is stored and used solely to post
                job alerts to your chosen channel. You can remove it at any time in Settings.
              </li>
            </ul>
          </Section>

          <Section id="data-retention" title="5. Data retention">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Account data</span> — retained while
                your account is active. Deleted within 30 days of an account deletion request.
              </li>
              <li>
                <span className="font-medium text-foreground">Session tokens</span> — expire
                automatically after 30 days of inactivity or on sign-out.
              </li>
              {/* <li>
                <span className="font-medium text-foreground">Notification credentials</span> — deleted
                immediately when you disconnect Telegram or Discord in Settings.
              </li> */}
              <li>
                <span className="font-medium text-foreground">Server logs</span> — retained for up to
                90 days for security and debugging, then purged automatically.
              </li>
            </ul>
          </Section>

          <Section id="your-rights" title="6. Your rights">
            <p>
              Depending on where you are located, you may have rights under GDPR (EU/UK),
              CCPA/CPRA (California), or equivalent laws:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li><span className="font-medium text-foreground">Access</span> — request a copy of the personal data we hold about you.</li>
              <li><span className="font-medium text-foreground">Correction</span> — ask us to correct inaccurate data.</li>
              <li><span className="font-medium text-foreground">Deletion</span> — request that we delete your account and associated data.</li>
              <li><span className="font-medium text-foreground">Portability</span> — receive your data in a structured, machine-readable format.</li>
              <li><span className="font-medium text-foreground">Opt-out of notifications</span> — disable Telegram or Discord alerts at any time in Settings → Notifications.</li>
              {/* <li><span className="font-medium text-foreground">Withdraw consent</span> — delete your account at any time in Settings.</li> */}
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section id="cookies" title="7. Cookies">
            <p>Jobify uses only essential cookies:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Session cookie</span> — keeps you
                signed in. Secure, HTTP-only, expires after 30 days of inactivity.
              </li>
              <li>
                <span className="font-medium text-foreground">Theme preference</span> — stores your
                light/dark mode choice. No personal data, expires after 1 year.
              </li>
            </ul>
            <p>
              We do not use advertising cookies, analytics cookies (e.g. Google Analytics),
              or any third-party tracking cookies.
            </p>
          </Section>

          <Section id="security" title="8. Security">
            <p>
              We implement industry-standard safeguards including TLS encryption in transit,
              encrypted storage at rest on GCP, and HTTP-only secure session cookies.
              OAuth tokens are never stored in plaintext.
            </p>
            <p>
              No system is perfectly secure. If you discover a security vulnerability,
              please disclose it responsibly to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="contact" title="9. Contact">
            <p>For privacy requests, questions, or concerns:</p>
            <p>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-4 rounded-lg border border-border/40 bg-secondary/30 p-4 text-xs text-muted-foreground/80">
              This policy may be updated periodically. The &ldquo;Last updated&rdquo; date at
              the top of this page reflects the most recent revision. Continued use of Jobify
              after a policy change constitutes acceptance of the updated terms.
            </p>
          </Section>

        </div>
      </div>

      {/* Back to home */}
      <div className="mt-16 border-t border-border/40 pt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Jobify
        </Link>
      </div>
    </div>
  );
}
