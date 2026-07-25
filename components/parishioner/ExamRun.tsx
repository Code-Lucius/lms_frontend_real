"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { examQ, PASS_MARK } from "@/lib/data";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";

type Attempt = { n: number; pct: number; passed: boolean; ts: string };

export function ExamRun({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);
  const [result, setResult] = useState<{ pct: number; passed: boolean; earned: number; total: number } | null>(null);

  useEffect(() => {
    if (graded) return;
    const id = setInterval(() => setSecondsLeft((s) => (s <= 1 ? (clearInterval(id), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [graded]);

  if (!active) return <Gate parishName={parishName} />;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const urgent = secondsLeft < 120;

  function submit() {
    let earned = 0, total = 0;
    examQ.forEach((q, i) => { total += q.m; if (answers[i] === q.correct) earned += q.m; });
    const pct = Math.round((earned / total) * 100);
    const passed = pct >= PASS_MARK;
    setResult({ pct, passed, earned, total });
    setGraded(true);
    setAttempts((a) => [...a, { n: a.length + 1, pct, passed, ts: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (graded && result) {
    const circ = 2 * Math.PI * 62;
    const off = circ * (1 - result.pct / 100);
    const col = result.passed ? "var(--sage)" : "var(--wine)";
    return (
      <div style={{ padding: "6px 0" }}>
        <div className="card result-card" style={{ maxWidth: 560, margin: "0 auto 22px" }}>
          <div className="eyebrow">Module 2 &middot; The Sacraments</div>
          <div className="score-ring">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--limestone-deep)" strokeWidth="11" />
              <circle cx="70" cy="70" r="62" fill="none" stroke={col} strokeWidth="11" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 70 70)" />
            </svg>
            <div className="pct"><b>{result.pct}%</b><span>{result.earned}/{result.total} marks</span></div>
          </div>
          <div className={`verdict ${result.passed ? "pass" : "fail"}`}>{result.passed ? "Passed \u2014 well done" : "Not passed yet"}</div>
          <p className="muted" style={{ margin: "0 auto 4px", maxWidth: 380 }}>{result.passed ? `You met the ${PASS_MARK}% pass mark for this module.` : `You need ${PASS_MARK}% to pass. The window is still open \u2014 you may try again.`}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <Link className="btn btn-ghost" href={`/${parishSlug}/exam`}>Back to exam centre</Link>
            <button className="btn btn-primary" onClick={() => { setAnswers({}); setGraded(false); setResult(null); setSecondsLeft(24 * 60); }}>Take exam again</button>
          </div>
        </div>
        <div className="card panel attempts" style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Your attempts</h2>
          {attempts.slice().reverse().map((a) => (
            <div className="attempt-row" key={a.n}>
              <div><span className="an">Attempt {a.n}</span>&nbsp;<span className="ts">{a.ts}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><b style={{ fontFamily: "Fraunces", fontSize: 17, color: a.passed ? "var(--sage)" : "var(--wine)" }}>{a.pct}%</b><Badge state={a.passed ? "active" : "closed"} /></div>
            </div>
          ))}
          <p className="faint" style={{ fontSize: 11.5, margin: "12px 0 0" }}>When the window closes, your highest score is recorded as the final grade.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "-28px -28px 0", display: "flex", flexDirection: "column" }}>
      <div className="exam-head">
        <div className="mod">Module 2 &middot; The Sacraments<small>Foundations of Catechesis &middot; Pass mark {PASS_MARK}%</small></div>
        <div className="spacer" />
        <span className="badge b-open" style={{ background: "rgba(62,107,79,.25)", color: "#BFE6CC" }}><span className="dot" style={{ background: "#BFE6CC" }} />Window open</span>
        <div className={`timer${urgent ? " urgent" : ""}`}><div><div className="lab">Closes in</div><div className="clock">{mm}:{ss}</div></div></div>
      </div>
      <div style={{ padding: 26, maxWidth: 760, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 14 }}><Link className="btn btn-ghost btn-sm" href={`/${parishSlug}/exam`}>&larr; Leave exam</Link></div>
        <div className="page-head" style={{ textAlign: "center", marginBottom: 24 }}><p style={{ margin: 0 }}>5 questions &middot; 10 marks &middot; You may retake while the window is open.</p></div>
        {examQ.map((q, i) => (
          <div className="card question" key={i}>
            <div className="qn"><div className="qnum">{i + 1}</div><div><div className="qtext">{q.t}</div><div className="qmarks">{q.m} marks</div></div></div>
            <div role="radiogroup" aria-label={`Question ${i + 1}`}>
              {q.opts.map((o, oi) => (
                <div
                  key={oi}
                  className={`opt${answers[i] === oi ? " sel" : ""}`}
                  role="radio" aria-checked={answers[i] === oi} tabIndex={0}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAnswers((a) => ({ ...a, [i]: oi })); } }}
                >
                  <span className="rk" /><span>{o}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}><button className="btn btn-primary" onClick={submit}>Submit exam</button></div>
      </div>
    </div>
  );
}
