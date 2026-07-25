import { Donut, DonutLegend, Bars, type Segment } from "@/components/ui";

export function Analytics() {
  const seg: Segment[] = [{ label: "Passed", value: 76, color: "var(--sage)" }, { label: "Not yet passed", value: 24, color: "var(--wine)" }];
  return (
    <>
      <div className="page-head"><h1>Analytics</h1><p>Pass/fail rates and average scores across the deanery.</p></div>
      <div className="grid-2">
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Pass rate</h2><div className="sub">All graded modules</div>
          <div className="donut-row" style={{ marginTop: 8 }}><Donut segments={seg} /><DonutLegend segments={seg} /></div>
        </div>
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Average score by module</h2><div className="sub">Deanery-wide</div>
          <Bars rows={[["Module 1 \u00b7 The Creed", 80], ["Module 2 \u00b7 The Sacraments", 79], ["Module 3 \u00b7 Life in Christ", 66]]} />
        </div>
      </div>
    </>
  );
}
