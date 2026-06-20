/**
 * Programmatic SEO page configuration.
 *
 * Each entry drives a dedicated landing page that:
 * - Renders at a predictable URL slug
 * - Pre-filters the job feed using existing gRPC criteria
 * - Displays curated stats blocks pulled from /api/internal/stats/stack
 * - Generates JSON-LD FAQPage schema for rich results
 *
 * To add a new page, append an entry to SEO_STACK_PAGES or SEO_ROLE_PAGES.
 * Pages are pre-rendered at build time via generateStaticParams().
 */

export interface SEOPage {
  /** URL slug — must not collide with a numeric job ID (no pure-number suffix). */
  slug: string;
  /** Primary tag used to filter jobs and fetch stats. */
  tag: string;
  /** H1 / <title> text. */
  title: string;
  /** Meta description (≤160 chars). */
  description: string;
  /** Short hero paragraph shown above the job feed. */
  heroCopy: string;
  /** FAQs shown below the job feed — rendered as FAQPage JSON-LD schema. */
  faqs: { question: string; answer: string }[];
  /** gRPC criteria passed to fetchJobs — merged with {descriptionTags: [tag]}. */
  extraCriteria?: {
    remote?: boolean;
    experienceMin?: number;
    experienceMax?: number;
    country?: string;
  };
  /**
   * Candidate skills the "Co-occurring Skills" stat is computed against.
   * Sent to the stats API; the backend ranks how often each appears alongside
   * `tag`. Falls back to DEFAULT_CO_OCCURRING_TAGS when omitted.
   */
  coOccurringTags?: string[];
}

/**
 * Default candidate pool for co-occurring-skill stats. Used by any SEOPage
 * that doesn't define its own `coOccurringTags`. Must match canonical tag names
 * produced by the job-processor skill extractor dictionary.
 */
export const DEFAULT_CO_OCCURRING_TAGS: string[] = [
  "AWS", "Docker", "Kubernetes", "PostgreSQL", "Redis",
  "FastAPI", "Django", "TypeScript", "React", "Terraform",
  "Spark", "Airflow", "GraphQL", "Golang", "Rust", "Node.js",
  "Next.js", "MongoDB", "Elasticsearch", "Kafka",
];

export const SEO_STACK_PAGES: SEOPage[] = [
  {
    slug: "python-developer-jobs",
    tag: "Python",
    title: "Python Developer Jobs — Live Openings from Company ATS",
    description:
      "Browse Python developer jobs sourced directly from Greenhouse, Lever, and Workday. Updated daily. No job board markup.",
    heroCopy:
      "Every Python role here is pulled straight from company career pages — no aggregator delays, no duplicate listings. Filter by experience level, remote preference, and location.",
    faqs: [
      {
        question: "What Python frameworks appear most often in job listings?",
        answer:
          "FastAPI and Django dominate backend roles, followed by Flask. Data-heavy positions frequently mention Pandas, Spark, and Airflow.",
      },
      {
        question: "Are there remote Python jobs?",
        answer:
          "Yes. Use the Remote filter in the sidebar to narrow results to fully remote positions.",
      },
      {
        question: "How do I filter Python jobs by experience level?",
        answer:
          "Use the Experience slider in the sidebar. Entry-level positions typically require 0–2 years, mid-level 3–5, and senior roles 6+.",
      },
    ],
  },
  {
    slug: "golang-jobs",
    tag: "golang",
    title: "Go (Golang) Developer Jobs — Direct from Company ATS",
    description:
      "Find Go / Golang engineering roles sourced directly from company career pages. Infrastructure, cloud, and backend positions updated daily.",
    heroCopy:
      "Go is the language of choice for high-performance services and cloud-native infrastructure. These roles are pulled straight from Greenhouse, Lever, Workday, and Ashby — no middlemen.",
    faqs: [
      {
        question: "What companies hire Go developers most?",
        answer:
          "Infrastructure companies, cloud providers, and fintech firms are the heaviest Go adopters. Check the Top Companies block on this page for a live ranking.",
      },
      {
        question: "Is Go experience required for all listed positions?",
        answer:
          "Most listings require Go as the primary language, but some infrastructure or platform roles list it alongside Rust or C++. Read each job's description for specifics.",
      },
    ],
  },
  {
    slug: "rust-developer-jobs",
    tag: "Rust",
    title: "Rust Developer Jobs — Systems & WebAssembly Roles",
    description:
      "Browse Rust engineering jobs from company ATS systems. Systems programming, WebAssembly, and blockchain positions updated daily.",
    heroCopy:
      "Rust is increasingly common in systems programming, game engines, and blockchain. All listings are sourced directly from company career pages.",
    faqs: [
      {
        question: "What types of companies hire Rust developers?",
        answer:
          "Blockchain companies, browser vendors, cloud infrastructure providers, and game studios are the biggest Rust employers.",
      },
      {
        question: "How senior are most Rust positions?",
        answer:
          "Rust roles skew senior (5+ years of experience) given the language's complexity, but junior positions exist especially in companies actively building Rust codebases.",
      },
    ],
  },
  {
    slug: "typescript-developer-jobs",
    tag: "TypeScript",
    title: "TypeScript Developer Jobs — Frontend, Backend & Fullstack",
    description:
      "TypeScript engineering jobs sourced directly from company ATS systems. React, Node.js, and fullstack roles updated daily.",
    heroCopy:
      "TypeScript spans the entire stack — from React frontends to Node.js APIs to edge workers. These roles come straight from company career pages, no aggregator noise.",
    faqs: [
      {
        question: "Do TypeScript jobs usually require React?",
        answer:
          "Frontend and fullstack roles usually pair TypeScript with React or Next.js. Backend roles more commonly pair it with Node.js, Nest.js, or Fastify.",
      },
      {
        question: "Are there TypeScript-only jobs?",
        answer:
          "Most listings describe TypeScript as the primary language for the codebase rather than requiring it exclusively. Strong JavaScript/TypeScript foundations are typically expected.",
      },
    ],
  },
  {
    slug: "kubernetes-jobs",
    tag: "Kubernetes",
    title: "Kubernetes & Cloud-Native Engineering Jobs",
    description:
      "Kubernetes, DevOps, and cloud-native engineering roles sourced directly from company career pages. Updated daily.",
    heroCopy:
      "Platform, SRE, and DevOps roles that list Kubernetes — pulled straight from company ATS systems so you see positions before they hit the major aggregators.",
    faqs: [
      {
        question: "Do Kubernetes jobs require CKA certification?",
        answer:
          "CKA and CKS certifications are mentioned in some job requirements but are rarely listed as mandatory. Strong hands-on experience is valued more than certifications.",
      },
      {
        question: "What cloud platforms appear alongside Kubernetes?",
        answer:
          "AWS EKS, GCP GKE, and Azure AKS are the most common. Roles often list Terraform and Helm as companion skills.",
      },
    ],
  },
  {
    slug: "remote-python-jobs",
    tag: "Python",
    title: "Remote Python Developer Jobs — Work From Anywhere",
    description:
      "Fully remote Python engineering jobs sourced directly from company ATS systems. Updated daily.",
    heroCopy:
      "All Python positions filtered to remote-friendly companies. Sourced directly from Greenhouse, Lever, and Workday — not reposted aggregator listings.",
    extraCriteria: { remote: true },
    faqs: [
      {
        question: "Are these jobs truly remote or just remote-friendly?",
        answer:
          "Listings are filtered to jobs where the company has marked the role as remote in their ATS. Always verify the specific location requirements in the job description.",
      },
    ],
  },
];

/** Derive slug → SEOPage lookup for O(1) access. */
export const SEO_PAGES_BY_SLUG: Record<string, SEOPage> = Object.fromEntries(
  SEO_STACK_PAGES.map((p) => [p.slug, p])
);

/** All slugs — used in generateStaticParams(). */
export const ALL_SEO_SLUGS = SEO_STACK_PAGES.map((p) => p.slug);
