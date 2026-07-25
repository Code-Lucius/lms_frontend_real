"use client";

import { useState } from "react";
import { Badge, Person } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import { parishioners } from "@/lib/data";

export function People({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
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
