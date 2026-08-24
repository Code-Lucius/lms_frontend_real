import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function POST() {
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/end-term", { method: "POST" }));
}