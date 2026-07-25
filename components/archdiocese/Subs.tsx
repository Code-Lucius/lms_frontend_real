"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { subRows as seedSubs, type SubRow } from "@/lib/data";

export function Subs() {
  const [subs, setSubs] = useState<SubRow[]>(seedSubs);

  function toggle(i: number, activate: boolean) {
    setSubs(subs.map((r, idx) => (idx === i ? { ...r, st: activate ? "active" : "suspended" } : r)));
  }
  return (
    <>
      <div className="page-head"><h1>Subscription manager</h1><p>Activate, renew, or suspend a parish. Suspended or expired parishes block their parishioners from content.</p></div>
      <div className="card panel">
        <table className="tbl"><thead><tr><th>Parish</th><th>Slug</th><th>Status</th><th>Start</th><th>Renews</th><th>Tier</th><th></th></tr></thead>
          <tbody>
            {subs.map((r, i) => (
              <tr key={i}>
                <td className="fw6">{r.p}</td><td><span className="slug-tag">/{r.slug}</span></td>
                <td><Badge state={r.st} /></td><td className="muted">{r.start}</td><td className="muted">{r.end}</td><td className="muted">{r.tier}</td>
                <td className="right">{r.st === "active"
                  ? <button className="btn btn-ghost btn-sm" onClick={() => toggle(i, false)}>Suspend</button>
                  : <button className="btn btn-brass btn-sm" onClick={() => toggle(i, true)}>Activate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
