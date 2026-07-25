"use server";

import { AuthError } from "next-auth";
import { signIn, signOut, auth } from "@/auth";
import type { Role } from "@/types/next-auth";
import { dashboardPathFor, loginPathFor } from "@/lib/roles";

interface LoginParams {
  email: string;
  password: string;
  endpoint: string; // e.g. "/archdiocese-admin/login" or "/stpeter/admin/login"
  role: Role;
  parishSlug?: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function login(params: LoginParams): Promise<LoginResult> {
  const { email, password, endpoint, role, parishSlug } = params;

  // --- Real authentication against Laravel happens entirely in this block. ---
  let res: Response;
  try {
    res = await fetch(`${process.env.LARAVEL_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { success: false, message: "Unable to reach the server. Please try again." };
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    return { success: false, message: "Unexpected server response." };
  }

  if (res.status === 422) {
    return { success: false, message: data.message ?? "Validation failed.", fieldErrors: data.errors };
  }
  if (res.status === 401 || res.status === 403) {
    return { success: false, message: data.message ?? "Invalid credentials." };
  }
  if (!res.ok || !data.token) {
    return { success: false, message: data.message ?? "Something went wrong. Please try again." };
  }

  // The Laravel response shape varies slightly by table (admin vs parishioner).
  const userRecord = data.admin ?? data.parishioner ?? data.user ?? {};

  // --- From here, NextAuth's only job is to encrypt this already-verified
  // result into the session cookie and redirect - it does NOT re-authenticate.
  // signIn() throws a special (non-error) redirect internally on success, so
  // this call must stay OUTSIDE the try/catch above, and only AuthError
  // instances get handled below - anything else (the redirect) must propagate.
  try {
    await signIn("credentials", {
      token: data.token,
      role,
      parishSlug: parishSlug ?? "",
      adminType: userRecord.type ?? "",
      userId: userRecord.id != null ? String(userRecord.id) : "",
      name: userRecord.name ?? "",
      redirectTo: dashboardPathFor(role, parishSlug),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: "Something went wrong finishing sign-in. Please try again." };
    }
    throw error; // the redirect (or any other real error) must propagate
  }

  return { success: true }; // unreachable in practice - signIn() always redirects or throws above
}

export async function logout() {
  const session = await auth();
  const token = session?.token;
  const role = session?.role;
  const parishSlug = session?.parishSlug;

  if (token) {
    try {
      await fetch(`${process.env.LARAVEL_API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      // best-effort revocation - we still clear the session below either way
    }
  }

  await signOut({ redirectTo: role ? loginPathFor(role, parishSlug) : "/stpeter/login" });
}
