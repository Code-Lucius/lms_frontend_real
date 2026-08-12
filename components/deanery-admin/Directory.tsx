"use client";

import { useState } from "react";
import { Badge, Person } from "@/components/ui";
import { hierarchy, parishioners, childCount, type Node } from "@/lib/data";

export function Directory() {
  const [path, setPath] = useState<number[]>([]);
  let cursor: Node[] = hierarchy;
  const labels: string[] = [];
  for (const idx of path) { labels.push(cursor[idx].label); cursor = cursor[idx].children ?? []; }
  const atParish = path.length === 3;
  const crumbs = (
    <div className="dir-crumbs">
      <button onClick={() => setPath([])}>Archdiocese</button>
      {labels.map((l, i) => (<span key={i}><span className="sep"> &rsaquo; </span><button onClick={() => setPath(path.slice(0, i + 1))}>{l}</button></span>))}
    </div>
  );

  return (
    <>
      <div className="page-head"><h1>Student directory</h1><p>Browse parishioners grouped by Region &rarr; Deanery &rarr; Parish. Drill down to a parish to see its members.</p></div>
      {crumbs}
      {atParish ? (
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Parishioners</h2><div className="sub">{labels[labels.length - 1]}</div>
          <table className="tbl"><thead><tr><th>Parishioner</th><th>Enrolment</th><th>Status</th></tr></thead>
            <tbody>{parishioners.map((p, i) => (<tr key={i}><td><Person name={p.n} email={p.e} /></td><td className="muted">{p.en}</td><td><Badge state={p.st} /></td></tr>))}</tbody>
          </table>
        </div>
      ) : (
        <div className="dir-grid">
          {cursor.map((n, i) => (
            <button className="dir-tile" key={i} onClick={() => setPath([...path, i])}>
              <span className="k">{n.kind}</span><span className="l">{n.label}</span>
              <span className="m">{n.kind === "Parish" ? n.count : childCount(n)}</span>
              {n.kind === "Parish" ? <Badge state={n.sub!} /> : null}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
