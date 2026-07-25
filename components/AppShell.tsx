"use client";

import { ReactNode, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { findActiveNavItem, type NavItem, type NavSection } from "@/lib/nav-match";

export type { NavItem, NavSection };

export function AppShell({
  brandTitle,
  brandSub,
  nav,
  who,
  children,
}: {
  brandTitle: string;
  brandSub: string;
  nav: NavSection[];
  who: { name: string; role: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const whoInitials = who.name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();

  const active = findActiveNavItem(pathname, nav);
  const activeHref = active?.item.href;
  const crumb = active?.item.label ?? brandSub;

  function isGroupOpen(item: NavItem): boolean {
    const containsActive = active?.groupHref === item.href;
    return expanded[item.href] ?? containsActive;
  }

  function toggleGroup(href: string, currentlyOpen: boolean) {
    setExpanded((e) => ({ ...e, [href]: !currentlyOpen }));
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mk">&#10013;</div>
          <div className="nm">{brandTitle}<small>{brandSub}</small></div>
        </div>
        {nav.map((section, si) => (
          <div key={si}>
            {section.label ? <div className="nav-label" style={si === 0 ? { paddingTop: 4 } : undefined}>{section.label}</div> : null}
            {section.items.map((item) =>
              item.children ? (
                <div key={item.href}>
                  <button
                    className="nav-item"
                    aria-expanded={isGroupOpen(item)}
                    onClick={() => toggleGroup(item.href, isGroupOpen(item))}
                  >
                    <span className="ic" aria-hidden>{item.icon}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                    <span aria-hidden style={{ fontSize: 11, opacity: 0.6 }}>{isGroupOpen(item) ? "\u25BE" : "\u25B8"}</span>
                  </button>
                  {isGroupOpen(item) && (
                    <div style={{ paddingLeft: 8 }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`nav-item${activeHref === child.href ? " on" : ""}`}
                          aria-current={activeHref === child.href ? "page" : undefined}
                          style={{ paddingLeft: 26 }}
                        >
                          <span className="ic" aria-hidden>{child.icon}</span>
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${activeHref === item.href ? " on" : ""}`}
                  aria-current={activeHref === item.href ? "page" : undefined}
                >
                  <span className="ic" aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            )}
          </div>
        ))}
        <div className="who">
          <div className="av">{whoInitials}</div>
          <div><div className="nm">{who.name}</div><div className="rl">{who.role}</div></div>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="ttl"><b>{crumb}</b></div>
          <div className="spacer" />
          <button
            className="btn btn-ghost btn-sm"
            disabled={isPending}
            onClick={() => startTransition(() => logout())}
          >
            {isPending ? "Signing out\u2026" : "Sign out"}
          </button>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
