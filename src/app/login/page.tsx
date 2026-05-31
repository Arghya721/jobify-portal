import { signIn } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Briefcase, Sparkles, Bell, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Log in | Jobify",
  description: "Log in to your Jobify account",
};

const FEATURES = [
  {
    icon: Briefcase,
    title: "10,000+ Active Roles",
    desc: "Curated from top companies, updated daily",
  },
  {
    icon: Sparkles,
    title: "AI Resume Matching",
    desc: "Your resume auto-filters jobs to your exact skills",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    desc: "Get notified the moment a perfect role drops",
  },
] as const;

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/jobs");
  }

  return (
    <div className="fixed inset-0 z-[60] grid lg:grid-cols-2 overflow-hidden">
      {/* ── Left panel ───────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col h-full overflow-hidden bg-zinc-950 pt-16">
        {/* Ambient orbs */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-56 h-56 rounded-full bg-violet-500/6 blur-3xl pointer-events-none" />

        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        {/* Hero copy + features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <div className="mb-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Your career, accelerated
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Land your dream job<br />faster with AI
            </h2>
          </div>

          <div className="space-y-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/70">
                  <Icon className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 p-10">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">
              &ldquo;This platform revolutionized our hiring process. We found the perfect candidates in half the time it usually takes.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white">
                SD
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sofia Davis</p>
                <p className="text-xs text-zinc-500">HR Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────── */}
      <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16 overflow-y-auto">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile-only tagline */}
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Your career, accelerated</p>
            <p className="text-sm text-zinc-400">AI-powered job matching for engineers</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 backdrop-blur-sm shadow-xl shadow-black/30">
            <div className="mb-8 space-y-1.5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-sm text-zinc-400">
                Sign in to continue your job search
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/jobs" });
              }}
            >
              <button
                type="submit"
                className="group relative w-full flex items-center gap-3 rounded-xl border border-zinc-700/80 bg-zinc-800/60 px-5 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-[0_0_24px_rgba(255,255,255,0.04)] active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="flex-1 text-left">Continue with Google</span>
                <ArrowRight className="h-4 w-4 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-300" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-600">
              By continuing you agree to our{" "}
              <Link href="/terms" className="text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
