import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

interface Params { params: { deaneryUuid: string } }

export async function GET(_request: Request, { params }: Params) {
  return proxyJson(() =>
    fetchWithAuth(`/region-admin/hierarchy/deaneries/${params.deaneryUuid}/parishes`)
  );
}