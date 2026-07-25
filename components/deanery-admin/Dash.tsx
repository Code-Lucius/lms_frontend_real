import { StatCard, Bars } from "@/components/ui";

export function Dash() {
  return (
    <>
      <div className="page-head"><div className="eyebrow">Ikeja Deanery &middot; Lagos Region</div><h1>Deanery overview</h1><p>Results and progress for every parish in your deanery. Grading happens at region level &mdash; your view is read-only.</p></div>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard lab="Parishes" val="2" meta="St. Peter \u00b7 Holy Cross" />
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
