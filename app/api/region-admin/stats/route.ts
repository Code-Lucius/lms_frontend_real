import { fetchWithAuth } from "@/lib/api";
import { proxyJson } from "@/lib/proxy";

export async function GET() {
  return proxyJson(() => fetchWithAuth(`/region-admin/stats`));
}