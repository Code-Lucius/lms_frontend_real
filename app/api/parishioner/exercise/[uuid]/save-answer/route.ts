import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { uuid: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body?.submission_id || !body?.question_id) {
    return NextResponse.json({ message: "submission_id and question_id are required" }, { status: 400 });
  }
  return proxyJson(() =>
    fetchWithAuth(`/${parish}/${params.uuid}/save-answer`, { method: "POST", body: JSON.stringify(body) })
  );
}