import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role, AdminType } from "@/types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours - matches the old iron-session cookie lifetime
  },
  pages: {
    // NextAuth's built-in pages are never actually shown - our own
    // middleware always redirects unauthenticated visitors to the correct
    // *role-specific* login page. This is just a required fallback.
    signIn: "/archdiocese-admin/login",
  },
  providers: [
    Credentials({
      // NOTE: this authorize() does NOT call Laravel. The real
      // email/password -> Sanctum token exchange happens in
      // app/actions/auth.ts's login() Server Action, which keeps all the
      // 401/403/422 error handling we already built. Once that succeeds,
      // it calls signIn("credentials", { ...alreadyVerifiedFields }) purely
      // to have NextAuth encrypt those fields into the session cookie -
      // this provider's only job is standing in for what iron-session did.
      credentials: {
        token: {},
        role: {},
        parishSlug: {},
        adminType: {},
        userId: {},
        name: {},
      },
      async authorize(credentials) {
        if (!credentials?.token || !credentials?.role) return null;
        return {
          id: String(credentials.userId ?? credentials.name ?? credentials.role),
          name: (credentials.name as string) || undefined,
          token: credentials.token as string,
          role: credentials.role as Role,
          parishSlug: (credentials.parishSlug as string) || undefined,
          adminType: (credentials.adminType as AdminType) || undefined,
          userId: credentials.userId ? Number(credentials.userId) : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in call - copy its
      // custom fields onto the long-lived token.
      // (Cast needed: the JWT type augmentation in types/next-auth.d.ts
      // doesn't merge cleanly against this beta's internal callback typing,
      // even though the fields are present and correctly typed everywhere
      // else. This is purely a type-checking workaround, not a runtime one.)
      if (user) {
        const u = user as typeof user & {
          token?: string;
          role?: Role;
          parishSlug?: string;
          adminType?: AdminType;
          userId?: number;
          name?: string;
        };
        token.token = u.token;
        token.role = u.role;
        token.parishSlug = u.parishSlug;
        token.adminType = u.adminType;
        token.userId = u.userId;
        token.name = u.name;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as typeof token & {
        token?: string;
        role?: Role;
        parishSlug?: string;
        adminType?: AdminType;
        userId?: number;
        name?: string;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionAny = session as any;
      sessionAny.token = t.token;
      sessionAny.role = t.role;
      sessionAny.parishSlug = t.parishSlug;
      sessionAny.adminType = t.adminType;
      sessionAny.userId = t.userId;
      sessionAny.name = t.name;
      return session;
    },
  },
});
