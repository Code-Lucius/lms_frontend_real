"use client";

import { Badge } from "@/components/ui";
import { IconCheck, IconAlert } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";

export function Subscription({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const rows: [string, string][] = [["Tier", "Standard"], ["Start date", "01 Jan 2026"], ["Renews", "31 Dec 2026"], ["Managed by", "Archdiocese IT"]];
  return (
    <>
      <div className="page-head"><h1>Subscription</h1><p>Your parish&rsquo;s access status. This is read-only &mdash; the archdiocese manages activation and renewal.</p></div>
      <div className="card panel" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "var(--sage-soft)" : "var(--wine-soft)", color: active ? "var(--sage)" : "var(--wine)" }}>
            {active ? <IconCheck width={22} height={22} /> : <IconAlert width={22} height={22} />}
          </div>
          <div><div style={{ fontFamily: "Fraunces", fontSize: 20 }}>{active ? "Active" : "Inactive"}</div><div style={{ fontSize: 12.5 }} className="muted">Parish of {parishName} &middot; {parishSlug}</div></div>
          <span className="spacer" /><Badge state={active ? "active" : "suspended"} />
        </div>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}><span className="muted">{k}</span><b>{v}</b></div>
        ))}
        <p className="faint" style={{ fontSize: 12.5, margin: "16px 0 0" }}>To change your subscription, contact the archdiocese office. Use the navigator&rsquo;s subscription switch above to preview the inactive state.</p>
      </div>
    </>
  );
}
