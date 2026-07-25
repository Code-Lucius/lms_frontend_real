export function Exams() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <>
      <div className="page-head"><div className="eyebrow" style={{ color: "var(--amber-ink)" }}>Planned module &middot; ready for the API</div><h1>Exam scheduler</h1><p>Assign exam days and time windows per module. Outside the window, the backend rejects all attempts.</p></div>
      <div className="grid-2">
        <div className="card panel">
          <h2>June 2026</h2><div className="sub">Module 2 &middot; The Sacraments</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 6 }}>
            {days.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, letterSpacing: ".08em", color: "var(--faint)", fontWeight: 600 }}>{d}</div>)}
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1; const sel = [13, 20].includes(day);
              return <div key={day} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, borderRadius: 9, border: `1px solid ${sel ? "var(--plum)" : "var(--border)"}`, background: sel ? "var(--plum)" : "#fff", color: sel ? "#fff" : "var(--ink)", cursor: "pointer", fontWeight: sel ? 600 : 400 }}>{day}</div>;
            })}
          </div>
        </div>
        <div className="card panel">
          <h2>Window for 13 June</h2><div className="sub">Selected exam day</div>
          <div style={{ display: "flex", gap: 12 }}><div className="field" style={{ flex: 1 }}><label>Opens</label><input type="time" defaultValue="09:00" /></div><div className="field" style={{ flex: 1 }}><label>Closes</label><input type="time" defaultValue="12:00" /></div></div>
          <div className="field"><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" defaultChecked style={{ width: "auto" }} /> Allow multiple attempts within the window</label></div>
          <div style={{ background: "var(--amber-soft)", color: "var(--amber-ink)", borderRadius: 11, padding: "12px 14px", fontSize: 12.5, marginBottom: 16 }}>Endpoints under <code>schedule-exam-window</code> are marked PLANNED in the PRD &mdash; wire these controls when the backend ships.</div>
          <button className="btn btn-primary btn-sm">Save exam window</button>
        </div>
      </div>
    </>
  );
}
