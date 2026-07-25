import type { DefaultSession } from "next-auth";

export type Role = "system-admin" | "region-admin" | "deanery-admin" | "parish-admin" | "parishioner";
export type AdminType = "super" | "finance" | "academic" | "administrative";

declare module "next-auth" {
  interface Session extends DefaultSession {
    token?: string;
    role?: Role;
    parishSlug?: string;
    adminType?: AdminType;
    userId?: number;
    name?: string;
  }

  interface User {
    token?: string;
    role?: Role;
    parishSlug?: string;
    adminType?: AdminType;
    userId?: number;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token?: string;
    role?: Role;
    parishSlug?: string;
    adminType?: AdminType;
    userId?: number;
    name?: string;
  }
}
