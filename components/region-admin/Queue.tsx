"use client";

import { useRouter } from "next/navigation";
import { Badge, Person, StatCard } from "@/components/ui";
import { submissions } from "@/lib/data";

export function Queue() {
  const router = useRouter();
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
            {submissions.map((s, i) => (
              <tr key={i} className={s.st === "pending" ? "click" : ""} onClick={s.st === "pending" ? () => router.push(`/region-admin/grade/${i}`) : undefined}>
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
