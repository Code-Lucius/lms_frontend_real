import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { uuid: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  return proxyJson(() => fetchWithAuth(`/${parish}/${params.uuid}/start-exercise`, { method: "POST" }));
}