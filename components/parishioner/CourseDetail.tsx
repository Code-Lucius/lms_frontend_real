"use client";

import Link from "next/link";
import { SubBanner, ProgressBar } from "@/components/ui";
import { IconDoc } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { courses, courseContent } from "@/lib/data";
import { Gate } from "./Gate";

export function CourseDetail({ idx, parishName, parishSlug }: { idx: number; parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  if (!active) return <Gate parishName={parishName} />;

  const co = courses[idx];
  const cc = courseContent[idx];

  if (!co || !cc) {
    return (
      <div className="card panel">
        <p>That course couldn&rsquo;t be found.</p>
        <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      </div>
    );
  }

  return (
    <>
      <SubBanner active={active} />
      <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      <div className="page-head" style={{ marginTop: 16 }}>
        <div className="eyebrow">{co.meta}</div>
        <h1>{co.name}</h1>
        <p>Work through each topic&rsquo;s materials, complete the exercises, then sit the module exam when its window opens.</p>
      </div>
      <div className="prog-row" style={{ maxWidth: 420 }}><span>Course progress</span><span>{co.prog}%</span></div>
      <ProgressBar value={co.prog} style={{ maxWidth: 420, marginBottom: 24 }} />
      {cc.topics.map((tp, ti) => (
        <div className="topic" key={ti}>
          <div className="th"><IconDoc width={16} height={16} style={{ color: "var(--brass)" }} /><span className="tn">{tp.t}</span><span className="tc">{tp.mats.length} materials</span></div>
          {tp.mats.map((m, mi) => (
            <div className="matrow" key={mi}>
              <span className={`mtype ${m.ty}`}>{m.ty}</span>
              <span className="mname" style={{ fontWeight: 400 }}>{m.n}</span>
              <span className="tc faint" style={{ fontSize: 12 }}>{m.len}</span>
              <span className="open">Open &rarr;</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link className="btn btn-ghost" href={`/${parishSlug}/exercise`}>Go to exercises</Link>
        <Link className="btn btn-primary" href={`/${parishSlug}/exam`}>View exam windows</Link>
      </div>
    </>
  );
}
