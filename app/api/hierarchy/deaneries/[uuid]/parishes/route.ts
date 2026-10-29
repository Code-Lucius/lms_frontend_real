import { NextRequest } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET(_request: NextRequest, { params }: { params: { uuid: string } }) {
  return proxyJson(() => fetchWithAuth(`/archdiocese-admin/hierarchy/deaneries/${params.uuid}/parishes`));
}