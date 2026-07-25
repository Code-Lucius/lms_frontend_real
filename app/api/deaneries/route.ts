import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

// Laravel's viewAll is scoped by region: GET /view-deaneries/{regionUuid}.
// The client must always pass ?region=<regionUuid> - there's no "all deaneries"
// endpoint on the backend.
export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get("region");
  if (!region) {
    return NextResponse.json({ message: "A region is required to list deaneries." }, { status: 400 });
  }
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-deaneries/${region}?page=${page}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-deanery", { method: "POST", body: JSON.stringify(body) }));
}
