import { NextRequest } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  return proxyJson(() => fetchWithAuth(`/region-admin/submission/${params.id}`));
}