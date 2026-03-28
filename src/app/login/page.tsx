import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Grid3X3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "Log in | Jobify",
  description: "Log in to your Jobify account",
};

export default async function LoginPage() {
  // If user is already logged in, redirect them to the home page or jobs page
  const session = await auth();
  if (session?.user) {
    redirect("/jobs");
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-zinc-900/10" />
        <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur mr-2">
             <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          Jobify
        </Link>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This platform revolutionized our hiring process. We found the perfect candidates in half the time it usually takes."
            </p>
            <footer className="text-sm">Sofia Davis, HR Director</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          
          <div className="grid gap-6">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/jobs" });
              }}
            >
              <Button variant="outline" type="submit" className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground transition-colors">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
