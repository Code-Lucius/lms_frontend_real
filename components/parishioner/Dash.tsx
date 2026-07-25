"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, SubBanner, ProgressBar, Lozenge } from "@/components/ui";
import { Arch } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { courses, availableCourses } from "@/lib/data";
import { Gate } from "./Gate";

export function Dash({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});

  if (!active) return <Gate parishName={parishName} />;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head">
        <Arch width={92} height={20} style={{ marginBottom: 8 }} />
        <h1>Peace be with you, Maria.</h1>
        <p>You&rsquo;re enrolled in {courses.length} courses. Module 2 of Foundations has an exam window open today.</p>
      </div>
      <div className="courses-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {courses.map((co, i) => (
          <div className="course" key={i}>
            <div className="top">
              <div><h3>{co.name}</h3><div className="meta">{co.meta}</div></div>
              <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}/course/${i}`}>Open course</Link>
            </div>
            <div className="prog-row"><span>Progress</span><span>{co.prog}%</span></div>
            <ProgressBar value={co.prog} />
            <div className="modlist">
              {co.modules.map((m, mi) => (
                <div className="modrow" key={mi}>
                  <div><span className="mn">{m.n}</span><div className="pm">Pass mark {m.pm}%</div></div>
                  <Badge state={m.exam.state} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Lozenge style={{ margin: "30px 0 18px" }} />
      <h2 style={{ fontFamily: "Fraunces", fontSize: 20, marginBottom: 4 }}>Available to enrol</h2>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 0 16px" }}>Courses open to your parish. Enrolment is available while your subscription is active.</p>
      <div className="enrol-grid">
        {availableCourses.map((c) => (
          <div className="card enrol" key={c.name}>
            <div className="en">{c.name}</div>
            <div className="ed">{c.meta}</div>
            {enrolled[c.name]
              ? <button className="btn btn-sm" style={{ alignSelf: "flex-start", background: "var(--sage-soft)", color: "var(--sage)" }} disabled>Enrolled &#10003;</button>
              : <button className="btn btn-brass btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setEnrolled((s) => ({ ...s, [c.name]: true }))}>Enrol</button>}
          </div>
        ))}
      </div>
    </>
  );
}
