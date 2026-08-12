import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.course_uuid || !body?.parish_slug) {
    return NextResponse.json({ message: "course_uuid and parish_slug are required" }, { status: 400 });
  }
  const { parish_slug, ...payload } = body;
  return proxyJson(() =>
    fetchWithAuth(`/${parish_slug}/enroll-to-course`, { method: "POST", body: JSON.stringify(payload) })
  );
}