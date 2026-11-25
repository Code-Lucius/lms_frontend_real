// "use client";

// import Link from "next/link";
// import { SubBanner, Badge } from "@/components/ui";
// import { useSubscription } from "@/lib/subscription";
// import { Gate } from "./Gate";

// export function ExamCentre({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
//   const { active } = useSubscription();
//   if (!active) return <Gate parishName={parishName} />;

//   // NOTE: attempt counts are static mock values here. In the old SPA these
//   // came from lifted React state shared with ExamRun/Results; now that each
//   // is a separate page load, that in-memory sharing doesn't carry over.
//   // Once wired to Laravel, these should come from a real attempts fetch.
//   const mods = [
//     { course: "Foundations of Catechesis", n: "Module 2 \u00b7 The Sacraments", d: "13", mo: "Jun", state: "open", win: "09:00 \u2013 12:00", pm: 70, attempts: 0 },
//     { course: "Foundations of Catechesis", n: "Module 3 \u00b7 Life in Christ", d: "18", mo: "Jun", state: "pending", win: "09:00 \u2013 11:00", pm: 65, attempts: 0 },
//     { course: "Sacred Scripture I", n: "Module 1 \u00b7 The Pentateuch", d: "20", mo: "Jun", state: "pending", win: "10:00 \u2013 12:30", pm: 70, attempts: 0 },
//     { course: "Foundations of Catechesis", n: "Module 1 \u00b7 The Creed", d: "06", mo: "Jun", state: "closed", win: "09:00 \u2013 12:00", pm: 70, attempts: 1 },
//   ];

//   return (
//     <>
//       <SubBanner active={active} />
//       <div className="page-head"><h1>Exam centre</h1><p>Each module exam opens only during its scheduled window. Outside it, the exam is sealed.</p></div>
//       {mods.map((m, i) => {
//         const cta = m.state === "open"
//           ? <Link className="btn btn-primary btn-sm" href={`/${parishSlug}/exam/run`}>Take exam</Link>
//           : m.state === "closed"
//             ? <button className="btn btn-ghost btn-sm" disabled>Window closed</button>
//             : <button className="btn btn-ghost btn-sm" disabled>Opens {m.d} {m.mo}</button>;
//         return (
//           <div className="card modcard" key={i}>
//             <div className={`when${m.state !== "open" ? " muted" : ""}`}><div className="d">{m.d}</div><div className="mo">{m.mo}</div></div>
//             <div className="body">
//               <div className="nm">{m.n}</div>
//               <div className="meta">{m.course} &middot; pass mark {m.pm}%</div>
//               <div className="win">
//                 <span>&#128337; {m.win}</span>
//                 {m.state === "open" ? <span className="countdown">closes in 24:00</span> : null}
//                 {m.attempts ? <span>{m.attempts} attempt{m.attempts > 1 ? "s" : ""} made</span> : null}
//               </div>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}><Badge state={m.state} />{cta}</div>
//           </div>
//         );
//       })}
//     </>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SubBanner, Badge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";
import type { ExamListItem, Paginated } from "@/lib/types";

function computeState(opensAt: string | null, closesAt: string | null): "open" | "pending" | "closed" {
  const now = Date.now();
  const opens = opensAt ? new Date(opensAt).getTime() : null;
  const closes = closesAt ? new Date(closesAt).getTime() : null;
  if (opens !== null && now < opens) return "pending";
  if (closes !== null && now > closes) return "closed";
  return "open";
}

function formatDay(iso: string | null) {
  if (!iso) return { d: "\u2014", mo: "" };
  const date = new Date(iso);
  return { d: String(date.getDate()).padStart(2, "0"), mo: date.toLocaleString("en-GB", { month: "short" }) };
}

function formatWindow(opensAt: string | null, closesAt: string | null) {
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "\u2014");
  return `${fmt(opensAt)} \u2013 ${fmt(closesAt)}`;
}

export function ExamCentre({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/parishioner/exams?page=1&parish=${parishSlug}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load exams.");
        setExams([]);
        return;
      }
      const paginated: Paginated<ExamListItem> = json.data;
      setExams(paginated?.data ?? []);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  if (!active) return <Gate parishName={parishName} />;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><h1>Exam centre</h1><p>Each module exam opens only during its scheduled window. Outside it, the exam is sealed.</p></div>

      {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}
      {isLoading && <div className="empty">Loading...</div>}
      {!isLoading && !exams.length && !listError && <div className="empty">No exams scheduled yet.</div>}

      {exams.map((exam) => {
        const state = computeState(exam.opens_at, exam.closes_at);
        const { d, mo } = formatDay(exam.opens_at);
        const cta = state === "open"
          ? <Link className="btn btn-primary btn-sm" href={`/${parishSlug}/exam/run?exam=${exam.uuid}`}>Take exam</Link>
          : state === "closed"
            ? <button className="btn btn-ghost btn-sm" disabled>Window closed</button>
            : <button className="btn btn-ghost btn-sm" disabled>Opens {d} {mo}</button>;

        return (
          <div className="card modcard" key={exam.uuid}>
            <div className={`when${state !== "open" ? " muted" : ""}`}><div className="d">{d}</div><div className="mo">{mo}</div></div>
            <div className="body">
              <div className="nm">{exam.title}</div>
              <div className="meta">{exam.module.course.name} &middot; {exam.module.name} &middot; pass mark {exam.pass_mark}%</div>
              <div className="win">
                <span>&#128337; {formatWindow(exam.opens_at, exam.closes_at)}</span>
                {state === "open" && exam.closes_at ? (
                  <span className="countdown">
                    closes {new Date(exam.closes_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                ) : null}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}><Badge state={state} />{cta}</div>
          </div>
        );
      })}
    </>
  );
}