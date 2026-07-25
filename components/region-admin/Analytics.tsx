import { Bars, Donut, DonutLegend, type Segment } from "@/components/ui";

export function Analytics() {
  const seg: Segment[] = [{ label: "Passed", value: 74, color: "var(--sage)" }, { label: "Not yet passed", value: 26, color: "var(--wine)" }];
  return (
    <>
      <div className="page-head"><div className="eyebrow">Lagos Region</div><h1>Analytics</h1><p>Performance across the region, per module and per parish.</p></div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Average score by module</h2><div className="sub">Foundations of Catechesis</div>
          <Bars rows={[["Module 1 \u00b7 The Creed", 86], ["Module 2 \u00b7 The Sacraments", 78], ["Module 3 \u00b7 Life in Christ", 64]]} />
        </div>
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Pass rate</h2><div className="sub">All graded modules &middot; this term</div>
          <div className="donut-row" style={{ marginTop: 8 }}><Donut segments={seg} /><DonutLegend segments={seg} /></div>
        </div>
      </div>
      <div className="card panel"><h2 style={{ fontSize: 17 }}>By parish</h2><div className="sub">Average score and pass rate per parish</div>
        <table className="tbl"><thead><tr><th>Parish</th><th>Parishioners</th><th>Avg. score</th><th>Pass rate</th></tr></thead>
          <tbody>
            {[["Parish of St. Peter", 214, "82%", "79%"], ["Holy Cross Cathedral", 388, "76%", "71%"], ["Our Lady of Apostles", 172, "80%", "75%"]].map((r, i) => (
              <tr key={i}><td className="fw6">{r[0]}</td><td className="muted">{r[1]}</td><td className="fw6">{r[2]}</td><td>{r[3]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
