// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import { STATIC_DASHBOARD_ROLE_BY_SEGMENT, loginPathFor } from "@/lib/roles";

// export default auth((req) => {
//   const { pathname } = req.nextUrl;

//     // Login / set-password / reset-password pages are always public.
//   if (pathname.endsWith("/login") || pathname.endsWith("/set-password") || pathname.endsWith("/reset-password")) {
//     return NextResponse.next();
//   }

//   const segments = pathname.split("/").filter(Boolean);
//   const first = segments[0];
//   if (!first) return NextResponse.next(); // "/" - handled by the page itself

//   const session = req.auth;

//   // 1. Flat dashboards: /archdiocese/*, /region-admin/*, /deanery-admin/*
//   const staticRole = STATIC_DASHBOARD_ROLE_BY_SEGMENT[first];
//   if (staticRole) {
//     if (!session || session.role !== staticRole) {
//       return NextResponse.redirect(new URL(loginPathFor(staticRole), req.url));
//     }
//     return NextResponse.next();
//   }

//   // 2. Anything else is /{parishSlug}/... - parish-admin or parishioner territory.
//   const slug = first;
//   const isAdminPath = segments[1] === "admin";

//   if (isAdminPath) {
//     // /{slug}/admin and every sub-route under it (results, admins, subscription, ...)
//     if (!session || session.role !== "parish-admin" || session.parishSlug !== slug) {
//       return NextResponse.redirect(new URL(`/${slug}/admin/login`, req.url));
//     }
//     return NextResponse.next();
//   }

//   // Everything else under /{slug}/... is parishioner territory - this now
//   // covers real sub-routes (/{slug}/exercise, /{slug}/course/2, ...), not
//   // just the bare /{slug} root.
//   if (!session || session.role !== "parishioner" || session.parishSlug !== slug) {
//     return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
//   }
//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
// };
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { STATIC_DASHBOARD_ROLE_BY_SEGMENT, loginPathFor } from "@/lib/roles";

const PUBLIC_SEGMENTS = new Set(["login", "set-password", "reset-password"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Login / set-password / reset-password pages are always public, no
  // matter what comes after them in the path (e.g. a parishioner ID after
  // /set-password/, or nothing after it for the admin flows).
  if (segments.some((s) => PUBLIC_SEGMENTS.has(s))) {
    return NextResponse.next();
  }

  const first = segments[0];
  if (!first) return NextResponse.next(); // "/" - handled by the page itself

  const session = req.auth;

  const staticRole = STATIC_DASHBOARD_ROLE_BY_SEGMENT[first];
  if (staticRole) {
    if (!session || session.role !== staticRole) {
      return NextResponse.redirect(new URL(loginPathFor(staticRole), req.url));
    }
    return NextResponse.next();
  }

  const slug = first;
  const isAdminPath = segments[1] === "admin";

  if (isAdminPath) {
    if (!session || session.role !== "parish-admin" || session.parishSlug !== slug) {
      return NextResponse.redirect(new URL(`/${slug}/admin/login`, req.url));
    }
    return NextResponse.next();
  }

  if (!session || session.role !== "parishioner" || session.parishSlug !== slug) {
    return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};