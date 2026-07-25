import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: ReactNode; children?: NavItem[] };
export type NavSection = { label?: string; items: NavItem[] };

function matchesHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/**
 * Finds the most specific nav item whose href is a prefix of the current
 * pathname (so dynamic sub-pages not listed in the nav, like
 * /region-admin/grade/3, still highlight their closest parent item and
 * inherit its label as the breadcrumb).
 */
export function findActiveNavItem(pathname: string, nav: NavSection[]): { item: NavItem; groupHref?: string } | null {
  let best: { item: NavItem; groupHref?: string } | null = null;
  let bestLen = -1;

  for (const section of nav) {
    for (const item of section.items) {
      if (item.children) {
        for (const child of item.children) {
          if (matchesHref(pathname, child.href) && child.href.length > bestLen) {
            best = { item: child, groupHref: item.href };
            bestLen = child.href.length;
          }
        }
      } else if (matchesHref(pathname, item.href) && item.href.length > bestLen) {
        best = { item };
        bestLen = item.href.length;
      }
    }
  }

  return best;
}
