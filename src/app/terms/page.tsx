import Link from "next/link";
import { ScrollText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Jobify",
  description: "The terms and conditions governing your use of Jobify.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "May 31, 2026";
const CONTACT_EMAIL = "support@jobify.run";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

const NAV_ITEMS = [
  { id: "acceptance",        label: "Acceptance" },
  { id: "description",       label: "The service" },
  { id: "accounts",          label: "Your account" },
  { id: "acceptable-use",    label: "Acceptable use" },
  { id: "job-listings",      label: "Job listings" },
  { id: "resume-analyser",   label: "Resume Analyser" },
  { id: "intellectual-prop", label: "Intellectual property" },
  { id: "disclaimers",       label: "Disclaimers" },
  { id: "liability",         label: "Limitation of liability" },
  { id: "termination",       label: "Termination" },
  { id: "changes",           label: "Changes to terms" },
  { id: "governing-law",     label: "Governing law" },
  { id: "contact",           label: "Contact" },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <ScrollText className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.15em] text-emerald-400/70 uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These Terms of Service govern your use of Jobify. By accessing or using
          the platform you agree to be bound by them. If you do not agree, do not
          use Jobify.
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Sticky sidebar nav */}
        <aside className="hidden shrink-0 lg:block lg:w-52">
          <nav className="sticky top-24 space-y-1" aria-label="Terms sections">
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

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By creating an account or otherwise using Jobify (&ldquo;the Service&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;), you confirm that you are at least 16 years
              old and have the legal capacity to enter into a binding agreement. If you are
              using Jobify on behalf of an organisation, you represent that you have authority
              to bind that organisation to these terms.
            </p>
          </Section>

          <Section id="description" title="2. The Service">
            <p>
              Jobify is an engineering job aggregator with AI-powered search assistance. We
              index job listings directly from company applicant tracking systems (ATS)
              including Greenhouse, Lever, Workday, and Eightfold. We do not accept job
              applications or facilitate hiring in any way.
            </p>
            <p>
              All job listings on Jobify are sourced from publicly accessible ATS pages.
              Clicking &ldquo;View&rdquo; on any listing redirects you to the employer&apos;s
              own application page. Your relationship with that employer is entirely separate
              from your relationship with Jobify.
            </p>
            <p>
              Authenticated users may access additional features including saved filters,
              smart alerts, and the AI Resume Analyser described in Section 6.
            </p>
          </Section>

          <Section id="accounts" title="3. Your Account">
            <p>
              Accounts are created via Google OAuth. You are responsible for
              maintaining the confidentiality of your session and for all activity that
              occurs under your account.
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Do not share your account credentials with others.</li>
              <li>Notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect unauthorised access.
              </li>
              <li>To delete your account, contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                . Account deletion is permanent and cannot be undone.
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms,
              abuse the platform, or engage in automated scraping without prior written consent.
            </p>
          </Section>

          <Section id="acceptable-use" title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Scrape, crawl, or systematically extract job data without written permission.</li>
              <li>Use automated scripts to query the platform at a rate that disrupts service for other users.</li>
              <li>Attempt to gain unauthorised access to any part of the infrastructure.</li>
              <li>Use the platform to distribute spam, malware, or harmful content.</li>
              <li>Impersonate another person or organisation.</li>
              <li>Circumvent any rate limits, access controls, or security measures.</li>
              <li>Use the Service for any unlawful purpose.</li>
            </ul>
            <p>
              Violation of these rules may result in immediate account termination and,
              where applicable, legal action.
            </p>
          </Section>

          <Section id="job-listings" title="5. Job Listings">
            <p>
              Jobify does not create, verify, or endorse any job listing. Listings are
              sourced automatically from public ATS pages and may contain errors, be
              outdated, or no longer be accepting applications.
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>We make no guarantee that any listed role is currently open or accurately described.</li>
              <li>We are not responsible for the hiring practices, compensation, or conduct of any employer.</li>
              <li>Any application you submit through a linked ATS is solely between you and that employer.</li>
              <li>Jobify does not guarantee employment, interviews, or responses from any employer.</li>
            </ul>
            <p>
              If you believe a listing is fraudulent or violates applicable law, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="resume-analyser" title="6. Resume Analyser — Data Use & Retention">
            <p>
              Jobify offers an AI-powered Resume Analyser feature (&ldquo;Resume Analyser&rdquo;)
              that allows authenticated users to upload a résumé (PDF or plain text) and receive
              automatically generated job search filter suggestions based on its contents.
            </p>
            <p className="font-medium text-foreground">
              By uploading a résumé you explicitly agree to the following:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-medium text-foreground">Retention.</span>{" "}
                Uploaded résumé files are stored on Google Cloud Storage and are{" "}
                <span className="font-medium text-foreground">not automatically deleted</span>{" "}
                after processing. Files are retained indefinitely unless you manually delete
                the upload from your account or request deletion by contacting us.
              </li>
              <li>
                <span className="font-medium text-foreground">Training use.</span>{" "}
                By uploading a résumé, you grant Jobify a non-exclusive, royalty-free,
                worldwide licence to use the contents of your résumé — including extracted
                text, skills, job titles, and experience — to train, fine-tune, evaluate,
                and improve Jobify&apos;s AI models and related services.
              </li>
              <li>
                <span className="font-medium text-foreground">Anonymisation.</span>{" "}
                Where feasible, personally identifiable information (name, email, phone number)
                will be stripped before résumé content is used in training datasets. However,
                we do not guarantee complete anonymisation and you should not upload résumés
                that contain information you are not willing to share with us.
              </li>
              <li>
                <span className="font-medium text-foreground">Slot limit.</span>{" "}
                Each account may store up to 3 résumé uploads at any time. Deleting an upload
                removes it from your account view and frees the slot, but the underlying file
                may be retained for training purposes as described above.
              </li>
              <li>
                <span className="font-medium text-foreground">No employment guarantee.</span>{" "}
                The AI-generated job search filters are suggestions only. Jobify makes no
                representation that these filters will produce accurate, complete, or relevant
                job matches.
              </li>
            </ul>
            <p>
              If you wish to request deletion of your résumé data from our training datasets,
              contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will honour deletion requests where technically feasible, but cannot
              guarantee removal from models that have already been trained.
            </p>
            <p>
              Do not upload résumés belonging to third parties without their explicit consent.
              Uploading a third party&apos;s résumé without consent is a violation of these
              Terms and may constitute a violation of applicable privacy law.
            </p>
          </Section>

          <Section id="intellectual-prop" title="7. Intellectual Property">
            <p>
              The Jobify name, logo, UI design, and source code are the property of Jobify
              and are protected by applicable intellectual property law. You may not copy,
              reproduce, or redistribute them without prior written consent.
            </p>
            <p>
              Job listing content (titles, descriptions, company names) belongs to the
              respective employers. Jobify does not claim ownership of indexed third-party content.
            </p>
          </Section>

          <Section id="disclaimers" title="8. Disclaimers">
            <p>
              The Service is provided <span className="font-medium text-foreground">&ldquo;as is&rdquo;</span> and{" "}
              <span className="font-medium text-foreground">&ldquo;as available&rdquo;</span> without
              warranties of any kind, either express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, error-free, or free
              of viruses or other harmful components. Job data may be incomplete, inaccurate,
              or stale.
            </p>
          </Section>

          <Section id="liability" title="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Jobify and its affiliates, officers,
              employees, and agents shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of (or inability to use)
              the Service, including but not limited to:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Loss of employment opportunities or income.</li>
              <li>Reliance on inaccurate or outdated job listings.</li>
              <li>Unauthorised access to your account data.</li>
              <li>Any actions or omissions of third-party employers.</li>
            </ul>
            <p>
              Our total aggregate liability to you for any claim arising under these Terms
              shall not exceed USD $100.
            </p>
          </Section>

          <Section id="termination" title="10. Termination">
            <p>
              Either party may terminate the relationship at any time. You may request account
              deletion by emailing us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We may suspend or terminate your access immediately,
              without notice, if we believe you have violated these Terms or if we discontinue
              the Service.
            </p>
            <p>
              Upon termination, your right to use the Service ceases immediately. Sections
              covering intellectual property, disclaimers, limitation of liability, and
              governing law survive termination.
            </p>
          </Section>

          <Section id="changes" title="11. Changes to Terms">
            <p>
              We may update these Terms at any time. Material changes will be indicated by
              updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued
              use of Jobify after changes are posted constitutes your acceptance of the
              revised Terms.
            </p>
            <p>
              We encourage you to review this page periodically. We will not notify users
              of minor editorial changes.
            </p>
          </Section>

          <Section id="governing-law" title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of India,
              without regard to conflict of law provisions. Any disputes arising under these
              Terms shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining
              provisions will continue in full force and effect.
            </p>
          </Section>

          <Section id="contact" title="13. Contact">
            <p>For questions about these Terms:</p>
            <p>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-4 rounded-lg border border-border/40 bg-secondary/30 p-4 text-xs text-muted-foreground/80">
              These Terms constitute the entire agreement between you and Jobify regarding
              use of the Service and supersede any prior agreements.
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
      </div>
    </div>
  );
}
