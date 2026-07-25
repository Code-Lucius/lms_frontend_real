import { NextRequest } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params {
  params: { uuid: string };
}

// Laravel's update route is POST, not PUT - multipart bodies with PUT are
// unreliable in PHP, so this intentionally matches the backend's own route.
export async function POST(request: NextRequest, { params }: Params) {
  const formData = await request.formData();
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/update-material/${params.uuid}`, { method: "POST", body: formData }));
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/delete-material/${params.uuid}`, { method: "DELETE" }));
}