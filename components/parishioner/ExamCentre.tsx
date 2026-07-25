"use client";

import Link from "next/link";
import { SubBanner, Badge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";

export function ExamCentre({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  if (!active) return <Gate parishName={parishName} />;

  // NOTE: attempt counts are static mock values here. In the old SPA these
  // came from lifted React state shared with ExamRun/Results; now that each
  // is a separate page load, that in-memory sharing doesn't carry over.
  // Once wired to Laravel, these should come from a real attempts fetch.
  const mods = [
    { course: "Foundations of Catechesis", n: "Module 2 \u00b7 The Sacraments", d: "13", mo: "Jun", state: "open", win: "09:00 \u2013 12:00", pm: 70, attempts: 0 },
    { course: "Foundations of Catechesis", n: "Module 3 \u00b7 Life in Christ", d: "18", mo: "Jun", state: "pending", win: "09:00 \u2013 11:00", pm: 65, attempts: 0 },
    { course: "Sacred Scripture I", n: "Module 1 \u00b7 The Pentateuch", d: "20", mo: "Jun", state: "pending", win: "10:00 \u2013 12:30", pm: 70, attempts: 0 },
    { course: "Foundations of Catechesis", n: "Module 1 \u00b7 The Creed", d: "06", mo: "Jun", state: "closed", win: "09:00 \u2013 12:00", pm: 70, attempts: 1 },
  ];

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><h1>Exam centre</h1><p>Each module exam opens only during its scheduled window. Outside it, the exam is sealed.</p></div>
      {mods.map((m, i) => {
        const cta = m.state === "open"
          ? <Link className="btn btn-primary btn-sm" href={`/${parishSlug}/exam/run`}>Take exam</Link>
          : m.state === "closed"
            ? <button className="btn btn-ghost btn-sm" disabled>Window closed</button>
            : <button className="btn btn-ghost btn-sm" disabled>Opens {m.d} {m.mo}</button>;
        return (
          <div className="card modcard" key={i}>
            <div className={`when${m.state !== "open" ? " muted" : ""}`}><div className="d">{m.d}</div><div className="mo">{m.mo}</div></div>
            <div className="body">
              <div className="nm">{m.n}</div>
              <div className="meta">{m.course} &middot; pass mark {m.pm}%</div>
              <div className="win">
                <span>&#128337; {m.win}</span>
                {m.state === "open" ? <span className="countdown">closes in 24:00</span> : null}
                {m.attempts ? <span>{m.attempts} attempt{m.attempts > 1 ? "s" : ""} made</span> : null}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}><Badge state={m.state} />{cta}</div>
          </div>
        );
      })}
    </>
  );
}
