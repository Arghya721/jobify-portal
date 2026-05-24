import Link from "next/link";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — Jobify",
  description: "How Jobify uses cookies and similar technologies.",
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
  { id: "what-are-cookies",  label: "What are cookies" },
  { id: "what-we-use",       label: "What we use" },
  { id: "what-we-dont-use",  label: "What we don't use" },
  { id: "third-party",       label: "Third-party cookies" },
  { id: "control",           label: "Your control" },
  { id: "contact",           label: "Contact" },
];

const COOKIES_TABLE = [
  {
    name: "__session",
    type: "Essential",
    purpose: "Keeps you signed in. HTTP-only, Secure flag set.",
    duration: "30 days (or until sign-out)",
  },
  {
    name: "next-auth.csrf-token",
    type: "Essential",
    purpose: "CSRF protection for authentication flows.",
    duration: "Session",
  },
  {
    name: "next-auth.callback-url",
    type: "Essential",
    purpose: "Stores the URL to redirect to after sign-in.",
    duration: "Session",
  },
  {
    name: "theme",
    type: "Preference",
    purpose: "Remembers your light / dark mode preference.",
    duration: "1 year",
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <Cookie className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.15em] text-emerald-400/70 uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Jobify uses a small number of strictly necessary cookies to operate. We
          do not use advertising cookies, analytics cookies, or any third-party
          tracking technology.
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Sticky sidebar nav */}
        <aside className="hidden shrink-0 lg:block lg:w-52">
          <nav className="sticky top-24 space-y-1" aria-label="Cookie policy sections">
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

          <Section id="what-are-cookies" title="1. What are cookies">
            <p>
              Cookies are small text files placed on your device by a website when you
              visit it. They allow the site to remember information about your visit —
              such as whether you are logged in — across page loads and sessions.
            </p>
            <p>
              Cookies are not programs and cannot execute code or deliver viruses. They
              are read only by the server that set them (or third parties, where applicable —
              though Jobify sets none of those).
            </p>
          </Section>

          <Section id="what-we-use" title="2. Cookies we use">
            <p>
              Jobify sets only four cookies, all strictly necessary or preference-based.
              None are used for advertising or cross-site tracking.
            </p>

            {/* Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/40">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES_TABLE.map((row, i) => (
                    <tr
                      key={row.name}
                      className={i < COOKIES_TABLE.length - 1 ? "border-b border-border/30" : ""}
                    >
                      <td className="px-4 py-3 font-mono text-foreground/80">{row.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          row.type === "Essential"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-2">
              All cookies are set on the{" "}
              <span className="font-mono text-foreground/80">jobify.run</span> domain only.
              None are accessible to third-party scripts.
            </p>
          </Section>

          <Section id="what-we-dont-use" title="3. What we don't use">
            <p>Jobify does not use:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Google Analytics or any analytics platform cookies.</li>
              <li>Facebook Pixel, Google Ads, or any advertising / retargeting cookies.</li>
              <li>Hotjar, FullStory, or any session-recording cookies.</li>
              <li>Intercom, HubSpot, or any CRM / chat widget cookies.</li>
              <li>Any cookie that tracks you across other websites.</li>
            </ul>
          </Section>

          <Section id="third-party" title="4. Third-party cookies">
            <p>
              Jobify does not load any third-party scripts that set cookies. When you
              click &ldquo;View&rdquo; on a job listing and are redirected to an employer&apos;s
              ATS (Greenhouse, Lever, Workday, Eightfold), that site operates under its
              own cookie policy. Jobify has no control over cookies set by external sites.
            </p>
            <p>
              When you sign in via Google OAuth, those providers may set their
              own cookies in the OAuth flow. Refer to{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>{" "}
              for details.
            </p>
          </Section>

          <Section id="control" title="5. Your control">
            <p>
              Because Jobify uses only essential and preference cookies, there is no
              opt-out banner — opting out of essential cookies would break sign-in.
            </p>
            <p>You can still manage cookies through your browser:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Delete all cookies</span> — clears
                your session (you will be signed out) and resets theme preference.
              </li>
              <li>
                <span className="font-medium text-foreground">Block cookies</span> — you can
                browse job listings without cookies, but sign-in will not work.
              </li>
              <li>
                <span className="font-medium text-foreground">Incognito / private mode</span> —
                cookies are deleted automatically when the window is closed.
              </li>
            </ul>
            <p>
              Browser-specific instructions:{" "}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Chrome</a>
              {" · "}
              <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Firefox</a>
              {" · "}
              <a href="https://support.apple.com/en-us/105082" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Safari</a>
              {" · "}
              <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Edge</a>
            </p>
          </Section>

          <Section id="contact" title="6. Contact">
            <p>Questions about this Cookie Policy:</p>
            <p>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-4 rounded-lg border border-border/40 bg-secondary/30 p-4 text-xs text-muted-foreground/80">
              This policy may be updated when we add or remove cookies. The &ldquo;Last
              updated&rdquo; date reflects the most recent revision.
            </p>
          </Section>

        </div>
      </div>

      {/* Footer nav */}
      <div className="mt-16 flex items-center gap-6 border-t border-border/40 pt-8">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Back to Jobify
        </Link>
        <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Privacy Policy →
        </Link>
        <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Terms of Service →
        </Link>
      </div>
    </div>
  );
}
