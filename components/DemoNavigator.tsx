"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSubscription } from "@/lib/subscription";

const LINKS = [
  { href: "/stpeter/login", label: "Parish login", match: ["/stpeter/login", "/stpeter/set-password"] },
  { href: "/stpeter", label: "Parishioner", match: ["/stpeter"] },
  { href: "/stpeter/admin", label: "Parish admin", match: ["/stpeter/admin"] },
  { href: "/region-admin", label: "Region admin", match: ["/region-admin"] },
  { href: "/deanery-admin", label: "Deanery admin", match: ["/deanery-admin"] },
  { href: "/archdiocese", label: "Archdiocese admin", match: ["/archdiocese"] },
];

export function DemoNavigator() {
  const pathname = usePathname() || "/";
  const { active, setActive } = useSubscription();
  return (
    <div id="navbar">
      <Link className="tag" href="/">Prototype &middot; Archdiocese LMS</Link>
      <div className="seg">
        {LINKS.map((l) => {
          const on = l.href === "/stpeter" ? pathname === "/stpeter" : l.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
          return <Link key={l.href} href={l.href} className={on ? "on" : ""}>{l.label}</Link>;
        })}
      </div>
      <div className="spacer" />
      <div className="sub-toggle">
        <span>Subscription</span>
        <button
          className={`switch${active ? " on" : ""}`}
          aria-pressed={active}
          title="Toggle parish subscription"
          onClick={() => setActive(!active)}
        />
        <span style={{ minWidth: 48 }}>{active ? "Active" : "Inactive"}</span>
      </div>
    </div>
  );
}
