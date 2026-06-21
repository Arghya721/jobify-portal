import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.BACKEND_API_URL;
  if (!baseUrl) return NextResponse.json(null, { status: 503 });

  const { searchParams } = req.nextUrl;
  const tag = searchParams.get("tag");
  const coOccurring = searchParams.get("coOccurring");
  if (!tag) return NextResponse.json(null, { status: 400 });

  let url = `${baseUrl}/api/v1/stats/stack?tag=${encodeURIComponent(tag)}`;
  if (coOccurring) url += `&coOccurring=${encodeURIComponent(coOccurring)}`;

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return NextResponse.json(null, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
