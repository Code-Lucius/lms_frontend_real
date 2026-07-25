export function Results() {
  const rows = [
    { p: "Parish of St. Peter", mod: "Module 2 \u00b7 The Sacraments", avg: "82%", pass: "79%" },
    { p: "Parish of St. Peter", mod: "Module 1 \u00b7 The Creed", avg: "86%", pass: "88%" },
    { p: "Holy Cross Cathedral", mod: "Module 2 \u00b7 The Sacraments", avg: "76%", pass: "71%" },
    { p: "Holy Cross Cathedral", mod: "Module 1 \u00b7 The Creed", avg: "74%", pass: "69%" },
  ];
  return (
    <>
      <div className="page-head"><h1>Results viewer</h1><p>Browse results by parish within the deanery. Filter by module or exercise.</p></div>
      <div className="card panel">
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <select className="field" style={{ margin: 0, width: "auto", padding: "9px 12px" }}><option>All parishes</option><option>Parish of St. Peter</option><option>Holy Cross Cathedral</option></select>
          <select className="field" style={{ margin: 0, width: "auto", padding: "9px 12px" }}><option>All modules</option><option>Module 1 \u00b7 The Creed</option><option>Module 2 \u00b7 The Sacraments</option></select>
        </div>
        <table className="tbl"><thead><tr><th>Parish</th><th>Module</th><th>Avg. score</th><th>Pass rate</th></tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}><td className="fw6">{r.p}</td><td className="muted">{r.mod}</td><td className="fw6">{r.avg}</td><td>{r.pass}</td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
