import { NextRequest } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { id: string } }

export async function POST(_request: NextRequest, { params }: Params) {
  return proxyJson(() => fetchWithAuth(`/region-admin/close-submission/${params.id}`, { method: "POST" }));
}