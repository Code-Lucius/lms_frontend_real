import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const topicUuid = request.nextUrl.searchParams.get("topic");
  if (!topicUuid) {
    return NextResponse.json({ message: "topic is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-exercises/${topicUuid}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-exercise", { method: "POST", body: JSON.stringify(body) }));
}