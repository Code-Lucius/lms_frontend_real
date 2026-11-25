import { fetchWithAuth, NotAuthenticatedError } from "@/lib/api";

export type Loaded<T> = { ok: true; data: T } | { ok: false; message: string; status: number };

export async function load<T>(path: string): Promise<Loaded<T>> {
  try {
    const res = await fetchWithAuth(path);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: json.message ?? "Request failed.", status: res.status };
    return { ok: true, data: json.data as T };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof NotAuthenticatedError ? "Not authenticated." : "Unable to reach the server.",
      status: 0,
    };
  }
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function withQuery(base: string, params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}