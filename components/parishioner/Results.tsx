"use client";

import { SubBanner, Badge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import { PASS_MARK } from "@/lib/data";

export function Results() {
  const { active } = useSubscription();
  const ex = [
    { t: "The Ten Commandments \u2014 Short Answer", m: "Module 1", st: "graded", sc: "18/20" },
    { t: "Reflection on the Beatitudes", m: "Module 3", st: "pending", sc: "\u2014" },
  ] as const;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><h1>My results</h1><p>Your exercise grades and exam attempt history, all in one place.</p></div>
      <div className="card panel" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17 }}>Exercises</h2><div className="sub">Graded by your region admin</div>
        <table className="tbl"><thead><tr><th>Exercise</th><th>Module</th><th>Status</th><th className="right">Score</th></tr></thead>
          <tbody>{ex.map((e, i) => (<tr key={i}><td className="fw5">{e.t}</td><td className="muted">{e.m}</td><td><Badge state={e.st} /></td><td className="right fw6">{e.sc}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="card panel">
        <h2 style={{ fontSize: 17 }}>Exam attempts</h2><div className="sub">Module 2 &middot; The Sacraments &middot; Pass mark {PASS_MARK}%</div>
        <div className="empty">No exam attempts yet. Take the Module 2 exam from the Exam centre while the window is open.</div>
      </div>
    </>
  );
}
