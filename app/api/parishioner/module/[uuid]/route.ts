import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params {
  params: { uuid: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (!parish) {
    return NextResponse.json({ message: "parish is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/${parish}/module/${params.uuid}`, { method: "GET" }));
}