import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params {
  params: { uuid: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/view-module/${params.uuid}`));
}

export async function PUT(request: NextRequest, { params }: Params) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  return proxyJson(() =>
    fetchWithAuth(`/archdiocese-admin/update-module/${params.uuid}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  );
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return proxyJson(() =>
    fetchWithAuth(`/archdiocese-admin/delete-module/${params.uuid}`, {
      method: "DELETE",
    })
  );
}