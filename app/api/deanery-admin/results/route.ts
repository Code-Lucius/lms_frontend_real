import { NextRequest } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const qs = new URLSearchParams();
  for (const key of ["term", "parish", "course", "module", "page"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) qs.set(key, value);
  }
  return proxyJson(() => fetchWithAuth(`/deanery-admin/results?${qs.toString()}`));
}