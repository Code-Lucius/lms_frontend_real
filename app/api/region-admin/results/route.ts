import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const status = request.nextUrl.searchParams.get("status") ?? "";
  const qs = new URLSearchParams({ page });
  if (search) qs.set("search", search);
  if (status) qs.set("status", status);
  return proxyJson(() => fetchWithAuth(`/region-admin/results?${qs.toString()}`));
}