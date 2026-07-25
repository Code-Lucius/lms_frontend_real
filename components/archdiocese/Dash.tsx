import Link from "next/link";
import { StatCard, Lozenge } from "@/components/ui";
import { Arch } from "@/components/icons";
import { subRows } from "@/lib/data";

export function Dash() {
  const activeCount = subRows.filter((r) => r.st === "active").length;
  return (
    <>
      <div className="page-head">
        <Arch width={92} height={20} style={{ marginBottom: 8 }} />
        <h1>Archdiocese overview</h1>
        <p>The whole system at a glance &mdash; every region, deanery, and parish.</p>
      </div>
      <div className="stats">
        <StatCard lab="Parishioners" val="1,928" meta="across 6 parishes" />
        <StatCard lab="Active courses" val="2" meta="5 modules total" />
        <StatCard lab="Pending grading" val="3" meta="1 region awaiting" />
        <StatCard lab="Subscriptions" val={activeCount} un={`/ ${subRows.length}`} meta="active parishes" />
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2>Parishes by subscription state</h2>
          <div className="sub">Across the archdiocese</div>
          {([["Active", 2, "var(--sage)"], ["Expired", 1, "var(--wine)"], ["Suspended", 1, "var(--wine)"], ["Pending", 1, "var(--amber-ink)"]] as [string, number, string][]).map(([l, n, col]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ flex: 1, fontSize: 13.5 }}>{l}</span>
              <b style={{ fontFamily: "Fraunces", fontSize: 16 }}>{n}</b>
            </div>
          ))}
          <Lozenge style={{ margin: "6px 0 14px" }} />
          <Link className="btn btn-ghost btn-sm" href="/archdiocese/subscriptions">Open subscription manager</Link>
        </div>
        <div className="card panel">
          <h2>Recent activity</h2>
          <div className="sub">Last 24 hours</div>
          {[["Holy Cross", "388 parishioners migrated"], ["St. Brigid", "subscription expired"], ["Lagos Region", "12 exercises graded"], ["Foundations", "Module 2 exam window opened"]].map(([a, b], i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brass)", marginTop: 7 }} />
              <div><b>{a}</b> &mdash; <span className="muted">{b}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
