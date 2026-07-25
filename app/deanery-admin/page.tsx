"use client";

import { useState } from "react";
import { AppShell, NavSection } from "@/components/AppShell";
import { StatCard, Bars, Donut, DonutLegend, Segment } from "@/components/ui";
import { IconGrid, IconCheckSquare, IconBars } from "@/components/icons";

type View = "dash" | "results" | "analytics";
const CRUMBS: Record<View, string> = { dash: "Dashboard", results: "Results viewer", analytics: "Analytics" };

export default function DeaneryAdminApp() {
  const [view, setView] = useState<View>("dash");
  const nav: NavSection[] = [{
    label: "Oversight",
    items: [
      { key: "dash", label: "Dashboard", icon: <IconGrid /> },
      { key: "results", label: "Results viewer", icon: <IconCheckSquare /> },
      { key: "analytics", label: "Analytics", icon: <IconBars /> },
    ],
  }];
  return (
    <AppShell brandTitle="Ikeja Deanery" brandSub="Deanery admin" nav={nav} active={view} onSelect={(k) => setView(k as View)} who={{ name: "Sr. Cecilia", role: "Deanery admin" }} crumb={CRUMBS[view]}>
      {view === "dash" && <Dash />}
      {view === "results" && <Results />}
      {view === "analytics" && <Analytics />}
    </AppShell>
  );
}

function Dash() {
  return (
    <>
      <div className="page-head"><div className="eyebrow">Ikeja Deanery &middot; Lagos Region</div><h1>Deanery overview</h1><p>Results and progress for every parish in your deanery. Grading happens at region level &mdash; your view is read-only.</p></div>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard lab="Parishes" val="2" meta="St. Peter · Holy Cross" />
        <StatCard lab="Parishioners" val="602" meta="across the deanery" />
        <StatCard lab="Avg. score" val="79" un="%" meta="all graded modules" />
      </div>
      <div className="grid-2">
        <div className="card panel"><h2>Progress by parish</h2><div className="sub">Average completion</div>
          <Bars rows={[["Parish of St. Peter", 72], ["Holy Cross Cathedral", 58]]} />
        </div>
        <div className="card panel"><h2>This week</h2><div className="sub">Activity in your deanery</div>
          {[["Holy Cross", "12 exercises graded"], ["St. Peter", "Module 2 exam window opened"], ["St. Peter", "8 new parishioners verified"]].map(([a, b], i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brass)", marginTop: 7 }} /><div><b>{a}</b> &mdash; <span className="muted">{b}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Results() {
  const rows = [
    { p: "Parish of St. Peter", mod: "Module 2 · The Sacraments", avg: "82%", pass: "79%" },
    { p: "Parish of St. Peter", mod: "Module 1 · The Creed", avg: "86%", pass: "88%" },
    { p: "Holy Cross Cathedral", mod: "Module 2 · The Sacraments", avg: "76%", pass: "71%" },
    { p: "Holy Cross Cathedral", mod: "Module 1 · The Creed", avg: "74%", pass: "69%" },
  ];
  return (
    <>
      <div className="page-head"><h1>Results viewer</h1><p>Browse results by parish within the deanery. Filter by module or exercise.</p></div>
      <div className="card panel">
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <select className="field" style={{ margin: 0, width: "auto", padding: "9px 12px" }}><option>All parishes</option><option>Parish of St. Peter</option><option>Holy Cross Cathedral</option></select>
          <select className="field" style={{ margin: 0, width: "auto", padding: "9px 12px" }}><option>All modules</option><option>Module 1 · The Creed</option><option>Module 2 · The Sacraments</option></select>
        </div>
        <table className="tbl"><thead><tr><th>Parish</th><th>Module</th><th>Avg. score</th><th>Pass rate</th></tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}><td className="fw6">{r.p}</td><td className="muted">{r.mod}</td><td className="fw6">{r.avg}</td><td>{r.pass}</td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}

function Analytics() {
  const seg: Segment[] = [{ label: "Passed", value: 76, color: "var(--sage)" }, { label: "Not yet passed", value: 24, color: "var(--wine)" }];
  return (
    <>
      <div className="page-head"><h1>Analytics</h1><p>Pass/fail rates and average scores across the deanery.</p></div>
      <div className="grid-2">
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Pass rate</h2><div className="sub">All graded modules</div>
          <div className="donut-row" style={{ marginTop: 8 }}><Donut segments={seg} /><DonutLegend segments={seg} /></div>
        </div>
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Average score by module</h2><div className="sub">Deanery-wide</div>
          <Bars rows={[["Module 1 · The Creed", 80], ["Module 2 · The Sacraments", 79], ["Module 3 · Life in Christ", 66]]} />
        </div>
      </div>
    </>
  );
}
