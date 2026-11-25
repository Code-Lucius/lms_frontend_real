import Link from "next/link";
import { StatCard, Lozenge } from "@/components/ui";
import { Arch } from "@/components/icons";
import { subRows } from "@/lib/data";
import { fetchWithAuth } from "@/lib/api";

interface DashboardStats {
  parishioners_total: number;
  parishes_total: number;
  courses_total: number;
  modules_total: number;
}

async function loadStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetchWithAuth("/archdiocese-admin/dashboard-stats");
    if (!res.ok) return null;

    console.log(res);
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function Dash() {
  const stats = await loadStats();
  const activeCount = subRows.filter((r) => r.st === "active").length;

  return (
    <>
      <div className="page-head">
        <Arch width={92} height={20} style={{ marginBottom: 8 }} />
        <h1>Archdiocese overview</h1>
        <p>The whole system at a glance &mdash; every region, deanery, and parish.</p>
      </div>
      <div className="stats">
        <StatCard
          lab="Parishioners"
          val={stats ? stats.parishioners_total.toLocaleString() : ""}
          meta={stats ? `across ${stats.parishes_total} parishes` : "unavailable"}
        />
        <StatCard
          lab="Active courses"
          val={stats ? stats.courses_total : ""}
          meta={stats ? `${stats.modules_total} modules total` : "unavailable"}
        />
        <StatCard lab="Subscriptions" val={activeCount} un={`/ ${subRows.length}`} meta="mock data" />
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2>Parishes by subscription state</h2>
          <div className="sub">Mock data &mdash; no subscriptions table exists yet</div>
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
          <div className="sub">Mock data &mdash; no activity log exists yet</div>
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