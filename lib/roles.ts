import type { Role } from "@/types/next-auth";

// Dashboard each role lands on after login. system-admin / region-admin /
// deanery-admin stay at flat routes; parish-admin and parishioner are scoped
// under the parish's own slug.
export function dashboardPathFor(role: Role, parishSlug?: string): string {
  switch (role) {
    case "system-admin":
      return "/archdiocese";
    case "region-admin":
      return "/region-admin";
    case "deanery-admin":
      return "/deanery-admin";
    case "parish-admin":
      return parishSlug ? `/${parishSlug}/admin` : "/stpeter/admin";
    case "parishioner":
      return parishSlug ? `/${parishSlug}` : "/stpeter";
  }
}

// Login page each role should be bounced back to when unauthenticated
// or accessing a dashboard that isn't theirs.
export function loginPathFor(role: Role, parishSlug?: string): string {
  switch (role) {
    case "system-admin":
      return "/archdiocese-admin/login";
    case "region-admin":
      return "/region-admin/login";
    case "deanery-admin":
      return "/deanery-admin/login";
    case "parish-admin":
      return parishSlug ? `/${parishSlug}/admin/login` : "/stpeter/admin/login";
    case "parishioner":
      return parishSlug ? `/${parishSlug}/login` : "/stpeter/login";
  }
}

// Only the three flat, non-parish-scoped dashboards map from a static first
// URL segment. parish-admin and parishioner are handled separately in
// middleware because their segment is a *slug*, not a fixed word.
export const STATIC_DASHBOARD_ROLE_BY_SEGMENT: Record<string, Role> = {
  archdiocese: "system-admin",
  "region-admin": "region-admin",
  "deanery-admin": "deanery-admin",
};
