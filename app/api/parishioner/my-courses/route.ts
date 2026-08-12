import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) {
    return NextResponse.json({ message: "parish is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/${parish}/view-my-courses`));
}