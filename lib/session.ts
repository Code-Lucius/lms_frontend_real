import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

// These match the Sanctum token abilities exactly, per role:
// - archdiocese-admin -> 'system-admin'
// - region-admin      -> 'region-admin'
// - deanery-admin     -> 'deanery-admin'
// - parish-admin      -> 'parish-admin'
// - parishioner       -> 'parishioner' (no real Sanctum ability on the token,
//                         but we still tag it in our own session for routing/guarding)
export type Role =
  | "system-admin"
  | "region-admin"
  | "deanery-admin"
  | "parish-admin"
  | "parishioner";

export interface SessionData {
  token?: string;
  role?: Role;
  parishSlug?: string; // set only for parish-admin / parishioner
  adminType?: "super" | "finance" | "academic"; // ArchdioceseAdmin.type - permission tier, distinct from role
  userId?: number;
  name?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "archdiocese_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours - align with your Sanctum token expiry policy
  },
};

// For use in Server Components / Server Actions / Route Handlers.
// (Route Handlers and middleware read/write the cookie differently -
// middleware.ts uses getIronSession(request, response, ...) directly.)
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.isLoggedIn === undefined) session.isLoggedIn = false;
  return session;
}
