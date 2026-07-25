import { auth } from "@/auth";

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

/**
 * Calls the Laravel API with the current session's Sanctum token attached.
 * Server-only - use in Route Handlers and Server Components/Actions, never
 * in Client Components. (Middleware reads the session differently, via the
 * `auth()` wrapper directly in middleware.ts.)
 */
export async function fetchWithAuth(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await auth();
  if (!session?.token) {
    throw new NotAuthenticatedError();
  }

  // const headers: Record<string, string> = {
  //   Accept: "application/json",
  //   Authorization: `Bearer ${session.token}`,
  //   ...(init.body ? { "Content-Type": "application/json" } : {}),
  //   ...((init.headers as Record<string, string>) ?? {}),
  // };
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
    ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  return fetch(`${process.env.LARAVEL_API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
