// import { NextRequest } from "next/server";
// import { fetchWithAuth } from "@/lib/api";
// import { proxyJson } from "@/lib/proxy";

// export async function GET(request: NextRequest) {
//   const deaneryUuid = request.nextUrl.searchParams.get("deanery");
//   if (!deaneryUuid) {
//     return new Response(JSON.stringify({ message: "deanery is required" }), { status: 400 });
//   }
//   return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-parishes/${deaneryUuid}`));
// }


import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const deaneryUuid = request.nextUrl.searchParams.get("deanery");
  if (!deaneryUuid) {
    return NextResponse.json({ message: "deanery is required" }, { status: 400 });
  }
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-parishes/${deaneryUuid}`));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth("/archdiocese-admin/create-parish", { method: "POST", body: JSON.stringify(body) }));
}