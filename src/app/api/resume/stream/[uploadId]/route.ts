import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { uploadId } = await params;

  const upstream = await fetch(
    `${API_BASE}/api/v1/resume/stream/${uploadId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      // Disable Next.js caching for SSE
      cache: "no-store",
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Failed to connect to stream", {
      status: upstream.status,
    });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
