import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const topicUuid = request.nextUrl.searchParams.get("topic");
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-materials/${topicUuid}`));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-material", { method: "POST", body: formData }));
}