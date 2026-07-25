"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SubBanner, Lozenge } from "@/components/ui";
import { exerciseQ } from "@/lib/data";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";

export function Exercise({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!active) return <Gate parishName={parishName} />;

  function onType() {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaving(false), 900);
  }

  if (submitted) {
    return (
      <>
        <SubBanner active={active} />
        <div className="card result-card" style={{ maxWidth: 520, margin: "30px auto" }}>
          <div className="icon" style={{ width: 62, height: 62, borderRadius: "50%", background: "var(--amber-soft)", color: "var(--amber-ink)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2v6M12 8l3 3M12 8l-3 3" /><circle cx="12" cy="16" r="6" /></svg>
          </div>
          <div className="verdict" style={{ color: "var(--amber-ink)" }}>Submitted for grading</div>
          <p className="muted" style={{ maxWidth: 380, margin: "0 auto" }}>Your reflection is now with the region admin. You&rsquo;ll see your grade here once it has been reviewed.</p>
          <Lozenge style={{ margin: "22px 0" }} />
          <button className="btn btn-ghost" onClick={() => router.push(`/${parishSlug}`)}>Back to my courses</button>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><div className="eyebrow">Foundations of Catechesis &middot; Module 3 &middot; Topic 2</div><h1>Reflection on the Beatitudes</h1><p>Answer each question in your own words. Your work saves automatically as you type.</p></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <span className="badge b-pending"><span className="dot" />Due 16 Jun 2026</span>
        <span className={`save-ind${saving ? " saving" : ""}`}><span className="dot" />{saving ? "Saving\u2026" : "All answers saved"}</span>
      </div>
      {exerciseQ.map((q, i) => (
        <div className="card question" key={i}>
          <div className="qn"><div className="qnum">{i + 1}</div><div><div className="qtext">{q}</div><div className="qmarks">Short answer</div></div></div>
          <div className="field" style={{ margin: 0 }}><textarea placeholder="Write your reflection\u2026" onInput={onType} /></div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn-ghost" onClick={() => router.push(`/${parishSlug}`)}>Save &amp; exit</button>
        <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit for grading</button>
      </div>
    </>
  );
}
