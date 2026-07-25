import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params {
  params: { uuid: string };
}

// Laravel's update route is POST, matching its own route definition.
export async function POST(request: NextRequest, { params }: Params) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/update-exercise/${params.uuid}`, { method: "POST", body: JSON.stringify(body) }));
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/delete-exercise/${params.uuid}`, { method: "DELETE" }));
}