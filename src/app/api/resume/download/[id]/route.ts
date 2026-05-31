import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const upstream = await fetch(`${API_BASE}/api/v1/resume/uploads/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new NextResponse("Not found", { status: upstream.status });
  }

  const bytes = await upstream.arrayBuffer();
  const contentDisposition = upstream.headers.get("Content-Disposition") ?? "inline";

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition,
    },
  });
}
