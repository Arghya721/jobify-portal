import { signOut } from "@/auth";
import { NextResponse } from "next/server";

// GET /api/auth/logout
// Called via window.location.href — a hard navigation that clears
// the Next.js client-side router cache before redirecting.
export async function GET() {
  await signOut({ redirectTo: "/" });
  return NextResponse.redirect("/");
}
