"use client";

import { useState } from "react";
import { AppShell, NavSection } from "@/components/AppShell";
import { Badge, Person, StatCard, Bars, Donut, DonutLegend, Segment } from "@/components/ui";
import { IconCheckSquare, IconBars, IconCheck } from "@/components/icons";
import { submissions as seedSubmissions, exerciseQ, type Submission } from "@/lib/data";

type View = "queue" | "grade" | "analytics";

export default function RegionAdminApp() {
  const [view, setView] = useState<View>("queue");
  const [subs, setSubs] = useState<Submission[]>(seedSubmissions);
  const [gradeIdx, setGradeIdx] = useState(0);
  const [savedView, setSavedView] = useState(false);

  const nav: NavSection[] = [{
    label: "Grading",
    items: [
      { key: "queue", label: "Grading queue", icon: <IconCheckSquare /> },
      { key: "analytics", label: "Analytics", icon: <IconBars /> },
    ],
  }];
  const activeKey = view === "grade" ? "queue" : view;
  const crumb = view === "analytics" ? "Analytics" : "Grading queue";

  function openGrade(i: number) { setGradeIdx(i); setSavedView(false); setView("grade"); }
  function saveGrade() {
    setSubs((s) => s.map((row) => (row.st === "pending" ? { ...row, st: "graded" } : row)));
    setSavedView(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell brandTitle="Lagos Region" brandSub="Region admin" nav={nav} active={activeKey} onSelect={(k) => setView(k as View)} who={{ name: "Fr. Emeka", role: "Region admin" }} crumb={crumb}>
      {view === "queue" && <Queue subs={subs} openGrade={openGrade} />}
      {view === "grade" && (savedView ? <Saved back={() => setView("queue")} /> : <GradeView idx={gradeIdx} subs={subs} back={() => setView("queue")} onSave={saveGrade} />)}
      {view === "analytics" && <Analytics />}
    </AppShell>
  );
}

function Queue({ subs, openGrade }: { subs: Submission[]; openGrade: (i: number) => void }) {
  return (
    <>
      <div className="page-head"><div className="eyebrow">Lagos Region</div><h1>Grading queue</h1><p>Exercises submitted by parishioners across your region, awaiting your review.</p></div>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard lab="Awaiting grading" val="3" meta="across 2 parishes" />
        <StatCard lab="Graded this week" val="12" meta="avg. score 81%" />
        <StatCard lab="Active parishioners" val="602" meta="4 parishes" />
      </div>
      <div className="card panel">
        <h2 style={{ fontSize: 17 }}>Submissions</h2><div className="sub">Select a submission to open the grading view</div>
        <table className="tbl"><thead><tr><th>Exercise</th><th>Parishioner</th><th>Parish</th><th>Submitted</th><th>Status</th></tr></thead>
          <tbody>
            {subs.map((s, i) => (
              <tr key={i} className={s.st === "pending" ? "click" : ""} onClick={s.st === "pending" ? () => openGrade(i) : undefined}>
                <td className="fw5">{s.ex}</td>
                <td><Person name={s.who} /></td>
                <td className="muted">{s.parish}</td><td className="muted">{s.date}</td><td><Badge state={s.st} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function GradeView({ idx, subs, back, onSave }: { idx: number; subs: Submission[]; back: () => void; onSave: () => void }) {
  const s = subs[idx];
  const answers = [
    "I think being poor in spirit means not relying on my own pride, but staying humble before God and open to His grace even when life is comfortable.",
    "On Tuesday two of my colleagues were arguing about a roster. I listened to both and suggested we split the early shifts fairly. They calmed down and agreed.",
    "\u201CBlessed are those who mourn.\u201D I find it hard because I usually try to avoid sadness rather than letting it bring me closer to God.",
  ];
  const seed = [8, 9, 7];
  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={back}>&larr; Back to queue</button>
      <div className="page-head" style={{ marginTop: 16 }}><div className="eyebrow">{s.parish} &middot; {s.date}</div><h1>{s.ex}</h1><p>Grading for <b style={{ color: "var(--ink)" }}>{s.who}</b> &middot; <Badge state="pending" /></p></div>
      {exerciseQ.map((q, qi) => (
        <div className="card question" key={qi}>
          <div className="qn"><div className="qnum">{qi + 1}</div><div><div className="qtext">{q}</div></div></div>
          <div style={{ background: "var(--limestone)", border: "1px solid var(--border)", borderRadius: 11, padding: "14px 16px", fontSize: 14, lineHeight: 1.55, marginBottom: 14, color: "var(--ink)" }}>{answers[qi]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="field" style={{ margin: 0, flex: "none", width: 130 }}><label style={{ marginBottom: 5 }}>Marks (of 10)</label><input type="number" defaultValue={seed[qi]} min={0} max={10} /></div>
            <div className="field" style={{ margin: 0, flex: 1 }}><label style={{ marginBottom: 5 }}>Comment (optional)</label><input placeholder="A note for the parishioner\u2026" /></div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}><button className="btn btn-brass" onClick={onSave}>Save grade &amp; release</button></div>
    </>
  );
}

function Saved({ back }: { back: () => void }) {
  return (
    <div className="card result-card" style={{ maxWidth: 480, margin: "40px auto" }}>
      <div className="icon" style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--sage-soft)", color: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><IconCheck width={28} height={28} /></div>
      <div className="verdict pass">Grade saved</div>
      <p className="muted" style={{ margin: "0 auto", maxWidth: 340 }}>The score is now visible to the parishioner and to parish &amp; deanery admins.</p>
      <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={back}>Back to queue</button>
    </div>
  );
}

function Analytics() {
  const seg: Segment[] = [{ label: "Passed", value: 74, color: "var(--sage)" }, { label: "Not yet passed", value: 26, color: "var(--wine)" }];
  return (
    <>
      <div className="page-head"><div className="eyebrow">Lagos Region</div><h1>Analytics</h1><p>Performance across the region, per module and per parish.</p></div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card panel"><h2 style={{ fontSize: 17 }}>Average score by module</h2><div className="sub">Foundations of Catechesis</div>
          <Bars rows={[["Module 1 · The Creed", 86], ["Module 2 · The Sacraments", 78], ["Module 3 · Life in Christ", 64]]} />
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
