import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { uuid: string } }

const base = (parish: string) => `/${encodeURIComponent(parish)}/parish-admin`;

export async function PUT(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  return proxyJson(() =>
    fetchWithAuth(`${base(parish)}/update-parish-admin/${params.uuid}`, { method: "PUT", body: JSON.stringify(body) })
  );
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const parish = request.nextUrl.searchParams.get("parish");
  if (!parish) return NextResponse.json({ message: "parish is required" }, { status: 400 });
  return proxyJson(() => fetchWithAuth(`${base(parish)}/delete-parish-admin/${params.uuid}`, { method: "DELETE" }));
}