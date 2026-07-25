import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { STATIC_DASHBOARD_ROLE_BY_SEGMENT, loginPathFor } from "@/lib/roles";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Login / set-password pages are always public.
  if (pathname.endsWith("/login") || pathname.endsWith("/set-password")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first) return NextResponse.next(); // "/" - handled by the page itself

  const session = req.auth;

  // 1. Flat dashboards: /archdiocese/*, /region-admin/*, /deanery-admin/*
  const staticRole = STATIC_DASHBOARD_ROLE_BY_SEGMENT[first];
  if (staticRole) {
    if (!session || session.role !== staticRole) {
      return NextResponse.redirect(new URL(loginPathFor(staticRole), req.url));
    }
    return NextResponse.next();
  }

  // 2. Anything else is /{parishSlug}/... - parish-admin or parishioner territory.
  const slug = first;
  const isAdminPath = segments[1] === "admin";

  if (isAdminPath) {
    // /{slug}/admin and every sub-route under it (results, admins, subscription, ...)
    if (!session || session.role !== "parish-admin" || session.parishSlug !== slug) {
      return NextResponse.redirect(new URL(`/${slug}/admin/login`, req.url));
    }
    return NextResponse.next();
  }

  // Everything else under /{slug}/... is parishioner territory - this now
  // covers real sub-routes (/{slug}/exercise, /{slug}/course/2, ...), not
  // just the bare /{slug} root.
  if (!session || session.role !== "parishioner" || session.parishSlug !== slug) {
    return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
