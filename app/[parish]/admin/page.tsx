"use client";

import { useState } from "react";
import { AppShell, NavSection } from "@/components/AppShell";
import { Badge, Person } from "@/components/ui";
import { IconUsers, IconBars, IconUserPlus, IconCard, IconSearch, IconCheck, IconAlert } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { parishioners, subRows } from "@/lib/data";

type View = "people" | "results" | "admins" | "subscription";
const CRUMBS: Record<View, string> = { people: "Parishioners", results: "Results", admins: "Parish admins", subscription: "Subscription" };

const parishAdmins = [
  { n: "John Adeyemi", e: "john.adeyemi@stpeter.org", role: "Lead admin" },
  { n: "Agnes Okoro", e: "agnes.okoro@stpeter.org", role: "Admin" },
];

export default function ParishAdminApp({ params }: { params: { parish: string } }) {
  const { parish } = params;
  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : parish;

  const { active } = useSubscription();
  const [view, setView] = useState<View>("people");
  const nav: NavSection[] = [{
    label: "Manage",
    items: [
      { key: "people", label: "Parishioners", icon: <IconUsers /> },
      { key: "results", label: "Results", icon: <IconBars /> },
      { key: "admins", label: "Parish admins", icon: <IconUserPlus /> },
      { key: "subscription", label: "Subscription", icon: <IconCard /> },
    ],
  }];
  return (
    <AppShell brandTitle={parishName} brandSub="Parish admin" nav={nav} active={view} onSelect={(k) => setView(k as View)} who={{ name: "John Adeyemi", role: "Parish admin" }} crumb={CRUMBS[view]}>
      <SubBar active={active} />
      {view === "people" && <People parishName={parishName} parishSlug={parish} />}
      {view === "results" && <Results />}
      {view === "admins" && <Admins parishName={parishName} />}
      {view === "subscription" && <Subscription active={active} parishName={parishName} parishSlug={parish} />}
    </AppShell>
  );
}

function SubBar({ active }: { active: boolean }) {
  return active ? (
    <div className="subbar ok"><IconCheck className="ic" /> Subscription active &middot; renews 31 Dec 2026 &middot; Standard tier. You can view this but only the archdiocese can change it.</div>
  ) : (
    <div className="subbar warn"><IconAlert className="ic" /> Subscription inactive &middot; parishioners are currently blocked from courses and exams. Contact the archdiocese to reactivate.</div>
  );
}

function People({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const [q, setQ] = useState("");
  const list = parishioners.filter((p) => p.n.toLowerCase().includes(q.toLowerCase()) || p.e.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="page-head"><div className="eyebrow">Parish of {parishName} &middot; {parishSlug}</div><h1>Parishioners</h1><p>Add members, send verification links, and follow their progress.</p></div>
      <div className="card panel">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="search"><IconSearch width={15} height={15} /><input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search parishioners" /></div>
          <div className="spacer" />
          <button className="btn btn-primary btn-sm">+ Add parishioner</button>
        </div>
        <table className="tbl"><thead><tr><th>Parishioner</th><th>Phone</th><th>Enrolment</th><th>Status</th></tr></thead>
          <tbody>
            {list.length ? list.map((p, i) => (
              <tr key={i}><td><Person name={p.n} email={p.e} /></td><td className="muted">{p.ph}</td><td className="muted">{p.en}</td><td><Badge state={p.st} /></td></tr>
            )) : <tr><td colSpan={4} className="empty">No parishioners match that search.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Results() {
  const rows = [
    { n: "Maria Okonkwo", mod: "Module 2 · The Sacraments", ex: "82%", exam: "86%", st: "active" },
    { n: "Daniel Eze", mod: "Module 1 · The Creed", ex: "74%", exam: "—", st: "active" },
    { n: "Grace Bello", mod: "Module 2 · The Sacraments", ex: "91%", exam: "78%", st: "active" },
    { n: "Ruth Adebayo", mod: "Module 1 · The Creed", ex: "Pending", exam: "—", st: "pending" },
  ] as const;
  return (
    <>
      <div className="page-head"><h1>Results</h1><p>Performance for parishioners in your parish. Grading is done by the region admin; you have read access here.</p></div>
      <div className="card panel">
        <table className="tbl"><thead><tr><th>Parishioner</th><th>Current module</th><th>Exercise</th><th>Exam</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}><td><Person name={r.n} /></td><td className="muted">{r.mod}</td><td className="fw6">{r.ex}</td><td className="fw6">{r.exam}</td><td><Badge state={r.st} /></td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}

function Admins({ parishName }: { parishName: string }) {
  return (
    <>
      <div className="page-head"><h1>Parish admins</h1><p>Add or remove admins for the Parish of {parishName}. Each new admin receives a verification link by email.</p></div>
      <div className="grid-2">
        <div className="card panel">
          <h2>Current admins</h2><div className="sub">{parishAdmins.length} people manage this parish</div>
          {parishAdmins.map((a) => (
            <div key={a.e} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <Person name={a.n} email={a.e} /><span className="spacer" /><span className="slug-tag">{a.role}</span>
            </div>
          ))}
        </div>
        <div className="card panel">
          <h2>Add an admin</h2><div className="sub">They&rsquo;ll set their own password via the link</div>
          <div className="field"><label>Full name</label><input placeholder="e.g. Peter Nwosu" /></div>
          <div className="field"><label>Email</label><input type="email" placeholder="name@stpeter.org" /></div>
          <button className="btn btn-primary btn-sm">Send invitation</button>
        </div>
      </div>
    </>
  );
}

function Subscription({ active, parishName, parishSlug }: { active: boolean; parishName: string; parishSlug: string }) {
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

