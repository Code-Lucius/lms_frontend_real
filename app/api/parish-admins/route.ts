import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

const base = (parish: string) => `/${encodeURIComponent(parish)}/parish-admin`;

export async function GET(request: NextRequest) {
  const parish = request.nextUrl.searchParams.get("parish");
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  return proxyJson(() => fetchWithAuth(`${base(parish)}/view-parish-admins?page=${page}`));
}

export async function POST(request: NextRequest) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() =>
    fetchWithAuth(`${base(parish)}/create-parish-admin`, { method: "POST", body: JSON.stringify(body) })
  );
}