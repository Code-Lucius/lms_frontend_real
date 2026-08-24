import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { examUuid: string } }
export async function POST(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body?.answers) return NextResponse.json({ message: "answers is required" }, { status: 400 });
  return proxyJson(() => fetchWithAuth(`/${parish}/exam/${params.examUuid}/submit`, { method: "POST", body: JSON.stringify(body) }));
}