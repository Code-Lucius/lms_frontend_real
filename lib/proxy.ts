import { NextResponse } from "next/server";
import { NotAuthenticatedError } from "@/lib/api";

/**
 * Runs a fetchWithAuth() call and converts the result (or any thrown error)
 * into a NextResponse, so every proxy route handler stays a one-liner.
 *
 * normalizeNoContent: Laravel sometimes returns 204 but still attaches a
 * JSON body (against spec) - NextResponse.json() cannot carry a body on a
 * 204, so we remap those to 200 rather than dropping the message.
 */
export async function proxyJson(call: () => Promise<Response>): Promise<NextResponse> {
  try {
    const res = await call();
    const data = await res.json().catch(() => ({}));
    const status = res.status === 204 ? 200 : res.status;
    return NextResponse.json(data, { status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }
    return NextResponse.json({ message: "Unable to reach the server." }, { status: 502 });
  }
}
