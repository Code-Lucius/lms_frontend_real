// "use server";

// import { redirect } from "next/navigation";
// import { loginPathFor } from "@/lib/roles";
// import type { Role } from "@/types/next-auth";

// interface SetPasswordParams {
//   endpoint: string;
//   token: string;
//   signature: string;
//   password: string;
//   passwordConfirmation: string;
//   role: Role;
//   parishSlug?: string;
// }

// export interface SetPasswordResult {
//   success: boolean;
//   message?: string;
//   fieldErrors?: Record<string, string[]>;
// }

// export async function setPassword(params: SetPasswordParams): Promise<SetPasswordResult> {
//   const { endpoint, token, signature, password, passwordConfirmation, role, parishSlug } = params;

//   let res: Response;
//   try {
//     res = await fetch(`${process.env.LARAVEL_API_URL}${endpoint}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({
//         token,
//         signature,
//         password,
//         password_confirmation: passwordConfirmation,
//       }),
//       cache: "no-store",
//     });
//   } catch {
//     return { success: false, message: "Unable to reach the server. Please try again." };
//   }

//   let data: any = {};
//   try {
//     data = await res.json();
//   } catch {
//     return { success: false, message: "Unexpected server response." };
//   }

//   if (res.status === 422) {
//     return { success: false, message: data.message ?? "Validation failed.", fieldErrors: data.errors };
//   }
//   if (!res.ok) {
//     return {
//       success: false,
//       message: data.message ?? "That link may be invalid or expired. Please contact your admin for a new one.",
//     };
//   }

//   redirect(loginPathFor(role, parishSlug));
// }

"use server";

import { redirect } from "next/navigation";
import { loginPathFor } from "@/lib/roles";
import type { Role } from "@/types/next-auth";

interface SetPasswordParams {
  endpoint: string; // base Laravel path, e.g. "/reset-password" or "/archdiocese-admin/set-password"
  linkParams: Record<string, string>; // everything read off the URL, e.g. { token, signature } or { parish_code, expires, signature }
  pathParam?: string; // key in linkParams to append as a URL path segment, e.g. "parish_code"
  queryParams?: string[]; // keys in linkParams to send as query string (needed for Laravel's `signed` middleware)
  bodyParams?: string[]; // keys in linkParams to send in the JSON body instead
  password: string;
  passwordConfirmation: string;
  role: Role;
  parishSlug?: string;
}

export interface SetPasswordResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function setPassword(params: SetPasswordParams): Promise<SetPasswordResult> {
  const {
    endpoint,
    linkParams,
    pathParam,
    queryParams = [],
    bodyParams = ["token", "signature"], // preserves existing archdiocese/tenant behavior by default
    password,
    passwordConfirmation,
    role,
    parishSlug,
  } = params;

  const url = new URL(`${process.env.LARAVEL_API_URL}${endpoint}`);

  if (pathParam && linkParams[pathParam]) {
    url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(linkParams[pathParam])}`;
  }

  for (const key of queryParams) {
    if (linkParams[key]) url.searchParams.set(key, linkParams[key]);
  }

  const bodyPayload: Record<string, string> = {
    password,
    password_confirmation: passwordConfirmation,
  };
  for (const key of bodyParams) {
    if (linkParams[key]) bodyPayload[key] = linkParams[key];
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(bodyPayload),
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
  if (!res.ok) {
    return {
      success: false,
      message: data.message ?? "That link may be invalid or expired. Please contact your admin for a new one.",
    };
  }

  redirect(loginPathFor(role, parishSlug));
}