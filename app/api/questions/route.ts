import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const exerciseUuid = request.nextUrl.searchParams.get("exercise");
  if (!exerciseUuid) {
    return NextResponse.json({ message: "exercise is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-all-exercise-questions/${exerciseUuid}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-question", { method: "POST", body: JSON.stringify(body) }));
}