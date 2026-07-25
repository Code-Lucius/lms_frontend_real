"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell, NavSection } from "@/components/AppShell";
import { Badge, SubBanner, ProgressBar, Lozenge } from "@/components/ui";
import { Arch, IconGrid, IconDoc, IconClock, IconBars, IconLock, IconCheck } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { courses, courseContent, availableCourses, examQ, exerciseQ, PASS_MARK, subRows } from "@/lib/data";

type View = "dash" | "exercise" | "exam" | "examrun" | "results" | "course";
type Attempt = { n: number; pct: number; passed: boolean; ts: string };

const CRUMBS: Record<View, string> = {
  dash: "My courses", exercise: "Exercises", exam: "Exam centre", examrun: "Module 2 exam", results: "My results", course: "Course",
};

export default function ParishionerApp({ params }: { params: { parish: string } }) {
  const { parish } = params;
  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : parish;

  const { active } = useSubscription();
  const [view, setView] = useState<View>("dash");
  const [courseIdx, setCourseIdx] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const nav: NavSection[] = [{
    label: "Learning",
    items: [
      { key: "dash", label: "My courses", icon: <IconGrid /> },
      { key: "exercise", label: "Exercises", icon: <IconDoc /> },
      { key: "exam", label: "Exam centre", icon: <IconClock /> },
      { key: "results", label: "My results", icon: <IconBars /> },
    ],
  }];

  // active sidebar key (examrun/course keep their parent highlighted)
  const activeKey = view === "examrun" ? "exam" : view === "course" ? "dash" : view;
  const gated = !active && ["dash", "exercise", "exam", "examrun", "course"].includes(view);

  function openCourse(i: number) { setCourseIdx(i); setView("course"); }

  return (
    <AppShell
      brandTitle={parishName} brandSub="Parishioner"
      nav={nav} active={activeKey} onSelect={(k) => setView(k as View)}
      who={{ name: "Maria Okonkwo", role: "Parishioner" }}
      crumb={view === "course" ? courses[courseIdx].name : CRUMBS[view]}
    >
      {gated ? <Gate parishName={parishName} /> : (
        <>
          {view === "dash" && <Dash active={active} openCourse={openCourse} />}
          {view === "exercise" && <Exercise active={active} onDone={() => setView("dash")} />}
          {view === "exam" && <ExamCentre active={active} attempts={attempts} onStart={() => setView("examrun")} />}
          {view === "examrun" && <ExamRun onLeave={() => setView("exam")} attempts={attempts} setAttempts={setAttempts} />}
          {view === "results" && <Results active={active} attempts={attempts} />}
          {view === "course" && <CourseDetail active={active} idx={courseIdx} back={() => setView("dash")} toExercise={() => setView("exercise")} toExam={() => setView("exam")} />}
        </>
      )}
    </AppShell>
  );
}

function Gate({ parishName }: { parishName: string }) {
  return (
    <div id="gate-bg" style={{ minHeight: "60vh" }}>
      <div className="card gate-card">
        <Arch style={{ margin: "-2px auto 6px" }} />
        <div className="icon"><IconLock width={28} height={28} /></div>
        <h1>Your parish is paused for now</h1>
        <p>{parishName}&rsquo;s subscription is currently inactive, so course content and exams are temporarily unavailable.</p>
        <p>Nothing you&rsquo;ve done is lost &mdash; your progress and results are safe and will return the moment the parish is reactivated.</p>
        <div className="contact"><b>Reach your parish admin</b>John Adeyemi &middot; admin@stpeter.org</div>
      </div>
    </div>
  );
}

function Dash({ active, openCourse }: { active: boolean; openCourse: (i: number) => void }) {
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
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
              <button className="btn btn-ghost btn-sm" onClick={() => openCourse(i)}>Open course</button>
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

function CourseDetail({ active, idx, back, toExercise, toExam }: { active: boolean; idx: number; back: () => void; toExercise: () => void; toExam: () => void }) {
  const co = courses[idx], cc = courseContent[idx];
  return (
    <>
      <SubBanner active={active} />
      <button className="btn btn-ghost btn-sm" onClick={back}>&larr; My courses</button>
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
        <button className="btn btn-ghost" onClick={toExercise}>Go to exercises</button>
        <button className="btn btn-primary" onClick={toExam}>View exam windows</button>
      </div>
    </>
  );
}

function Exercise({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
          <button className="btn btn-ghost" onClick={onDone}>Back to my courses</button>
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
        <button className="btn btn-ghost" onClick={onDone}>Save &amp; exit</button>
        <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit for grading</button>
      </div>
    </>
  );
}

function ExamCentre({ active, attempts, onStart }: { active: boolean; attempts: Attempt[]; onStart: () => void }) {
  const mods = [
    { course: "Foundations of Catechesis", n: "Module 2 · The Sacraments", d: "13", mo: "Jun", state: "open", win: "09:00 – 12:00", pm: 70, attempts: attempts.length },
    { course: "Foundations of Catechesis", n: "Module 3 · Life in Christ", d: "18", mo: "Jun", state: "pending", win: "09:00 – 11:00", pm: 65, attempts: 0 },
    { course: "Sacred Scripture I", n: "Module 1 · The Pentateuch", d: "20", mo: "Jun", state: "pending", win: "10:00 – 12:30", pm: 70, attempts: 0 },
    { course: "Foundations of Catechesis", n: "Module 1 · The Creed", d: "06", mo: "Jun", state: "closed", win: "09:00 – 12:00", pm: 70, attempts: 1 },
  ];
  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><h1>Exam centre</h1><p>Each module exam opens only during its scheduled window. Outside it, the exam is sealed.</p></div>
      {mods.map((m, i) => {
        const cta = m.state === "open"
          ? <button className="btn btn-primary btn-sm" onClick={onStart}>Take exam</button>
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

function ExamRun({ onLeave, attempts, setAttempts }: { onLeave: () => void; attempts: Attempt[]; setAttempts: (a: Attempt[]) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);
  const [result, setResult] = useState<{ pct: number; passed: boolean; earned: number; total: number } | null>(null);

  useEffect(() => {
    if (graded) return;
    const id = setInterval(() => setSecondsLeft((s) => (s <= 1 ? (clearInterval(id), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [graded]);

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
    setAttempts([...attempts, { n: attempts.length + 1, pct, passed, ts: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) }]);
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
            <button className="btn btn-ghost" onClick={onLeave}>Back to exam centre</button>
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
        <div style={{ marginBottom: 14 }}><button className="btn btn-ghost btn-sm" onClick={onLeave}>&larr; Leave exam</button></div>
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

function Results({ active, attempts }: { active: boolean; attempts: Attempt[] }) {
  const ex = [
    { t: "The Ten Commandments — Short Answer", m: "Module 1", st: "graded", sc: "18/20" },
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
        {attempts.length ? attempts.slice().reverse().map((a) => (
          <div className="attempt-row" key={a.n}>
            <div><span className="an">Attempt {a.n}</span>&nbsp;<span className="ts">{a.ts}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><b style={{ fontFamily: "Fraunces", fontSize: 17, color: a.passed ? "var(--sage)" : "var(--wine)" }}>{a.pct}%</b><Badge state={a.passed ? "active" : "closed"} /></div>
          </div>
        )) : <div className="empty">No exam attempts yet. Take the Module 2 exam from the Exam centre while the window is open.</div>}
      </div>
    </>
  );
}
