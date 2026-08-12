import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { submissionId: string; answerId: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const body = await request.json().catch(() => null);
  if (body?.score == null) {
    return NextResponse.json({ message: "score is required" }, { status: 400 });
  }
  return proxyJson(() =>
    fetchWithAuth(`/region-admin/grade-answer/${params.submissionId}/${params.answerId}`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}