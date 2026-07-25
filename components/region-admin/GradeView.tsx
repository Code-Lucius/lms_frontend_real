"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { submissions, exerciseQ } from "@/lib/data";

export function GradeView({ idx }: { idx: number }) {
  const [saved, setSaved] = useState(false);
  const s = submissions[idx];
  const answers = [
    "I think being poor in spirit means not relying on my own pride, but staying humble before God and open to His grace even when life is comfortable.",
    "On Tuesday two of my colleagues were arguing about a roster. I listened to both and suggested we split the early shifts fairly. They calmed down and agreed.",
    "\u201CBlessed are those who mourn.\u201D I find it hard because I usually try to avoid sadness rather than letting it bring me closer to God.",
  ];
  const seed = [8, 9, 7];

  if (!s) {
    return (
      <div className="card panel">
        <p>That submission couldn&rsquo;t be found.</p>
        <Link className="btn btn-ghost btn-sm" href="/region-admin">&larr; Back to queue</Link>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="card result-card" style={{ maxWidth: 480, margin: "40px auto" }}>
        <div className="icon" style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--sage-soft)", color: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <IconCheck width={28} height={28} />
        </div>
        <div className="verdict pass">Grade saved</div>
        <p className="muted" style={{ margin: "0 auto", maxWidth: 340 }}>The score is now visible to the parishioner and to parish &amp; deanery admins.</p>
        <Link className="btn btn-ghost" style={{ marginTop: 20 }} href="/region-admin">Back to queue</Link>
      </div>
    );
  }

  return (
    <>
      <Link className="btn btn-ghost btn-sm" href="/region-admin">&larr; Back to queue</Link>
      <div className="page-head" style={{ marginTop: 16 }}>
        <div className="eyebrow">{s.parish} &middot; {s.date}</div>
        <h1>{s.ex}</h1>
        <p>Grading for <b style={{ color: "var(--ink)" }}>{s.who}</b> &middot; <Badge state="pending" /></p>
      </div>
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
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button className="btn btn-brass" onClick={() => setSaved(true)}>Save grade &amp; release</button>
      </div>
    </>
  );
}
