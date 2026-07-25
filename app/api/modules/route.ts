import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const course = request.nextUrl.searchParams.get("course");

  if (!course) {
    return NextResponse.json(
      { message: "A course is required to list modules." },
      { status: 400 }
    );
  }

  const page = request.nextUrl.searchParams.get("page") ?? "1";

  return proxyJson(() =>
    fetchWithAuth(`/archdiocese-admin/view-modules/${course}?page=${page}`)
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  return proxyJson(() =>
    fetchWithAuth("/archdiocese-admin/create-module", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}