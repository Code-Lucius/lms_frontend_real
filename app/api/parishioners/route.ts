import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const parish = request.nextUrl.searchParams.get("parish");
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (!parish) {
    return NextResponse.json({ message: "parish is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/${parish}/parish-admin/view-parishioners?page=${page}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.parish_slug) {
    return NextResponse.json({ message: "parish_slug is required" }, { status: 400 });
  }
  const { parish_slug, ...payload } = body;
  return proxyJson(() =>
    fetchWithAuth(`/${parish_slug}/parish-admin/create-parishioner`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}