import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const moduleUuid = request.nextUrl.searchParams.get("module");
  if (!moduleUuid) {
    return NextResponse.json({ message: "module is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-topics/${moduleUuid}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-topic", { method: "POST", body: JSON.stringify(body) }));
}