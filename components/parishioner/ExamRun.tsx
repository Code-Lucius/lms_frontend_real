"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";
import { isNoActiveTermError } from "@/lib/api-errors";
import { NoActiveTermBanner } from "@/components/ui/NoActiveTermBanner";

interface ExamOption {
  uuid: string;
  option_text: string;
}

interface ExamQuestion {
  uuid: string;
  question_text: string;
  marks: number;
  order: number;
  options: ExamOption[];
}

interface AttemptSummary {
  percentage: number;
  passed: boolean;
  submitted_at: string;
}

interface ExamData {
  uuid: string;
  title: string;
  instructions: string | null;
  pass_mark: number;
  allow_multiple_attempts: boolean;
  opens_at: string | null;
  closes_at: string | null;
  window_open: boolean;
  can_attempt: boolean;
  questions: ExamQuestion[];
  attempts: AttemptSummary[];
}

interface Result {
  percentage: number;
  passed: boolean;
  score: number;
  total_marks: number;
  pass_mark: number;
  attempt_number: number;
}

export function ExamRun({ examUuid, parishName, parishSlug }: { examUuid: string; parishName: string; parishSlug: string }) {
  const { active } = useSubscription();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noActiveTerm, setNoActiveTerm] = useState(false);
  const [exam, setExam] = useState<ExamData | null>(null);

  // Gates the actual fullscreen exam-taking view behind an explicit user
  // click - requestFullscreen() only works when called synchronously from
  // a real user gesture, so it can never succeed from a useEffect that
  // runs after data loads. See startExam() below.
  const [examStarted, setExamStarted] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [showExitWarning, setShowExitWarning] = useState(false);
  const exitCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false); // prevents the exit-detection from firing the warning after a real submit

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/parishioner/exam/${examUuid}?parish=${parishSlug}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        if (isNoActiveTermError(json)) {
          setNoActiveTerm(true);
          return;
        }
        setLoadError(json.message ?? "That exam couldn't be loaded.");
        return;
      }
      setExam(json.data);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [examUuid, parishSlug]);

  useEffect(() => {
    load();
  }, [load]);

  // Detect exits - fullscreen exit or tab/visibility change - only once the
  // student has actually started the exam (not while still on the start
  // screen, and not once they've submitted).
  useEffect(() => {
    if (!exam?.can_attempt || !examStarted || result) return;

    function flagExit() {
      if (submittedRef.current) return;
      exitCountRef.current += 1;
      setShowExitWarning(true);
    }

    function onFullscreenChange() {
      if (!document.fullscreenElement) flagExit();
    }
    function onVisibilityChange() {
      if (document.hidden) flagExit();
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [exam?.can_attempt, examStarted, result]);

  // Called directly from the "Start exam" button's onClick - this is a
  // genuine user gesture, so requestFullscreen() is allowed to succeed here.
  async function startExam() {
    await containerRef.current?.requestFullscreen?.().catch(() => {
      // Fullscreen can be denied/unsupported - the exam still works,
      // just without the fullscreen takeover.
    });
    setExamStarted(true);
  }

  async function resumeExam() {
    setShowExitWarning(false);
    await containerRef.current?.requestFullscreen?.().catch(() => {});
  }

  function selectOption(questionUuid: string, optionUuid: string) {
    setAnswers((a) => ({ ...a, [questionUuid]: optionUuid }));
  }

  async function handleSubmit() {
    if (!exam) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        answers: exam.questions.map((q) => ({
          question_uuid: q.uuid,
          option_uuid: answers[q.uuid] ?? null,
        })),
        exit_count: exitCountRef.current,
      };

      const res = await fetch(`/api/parishioner/exam/${examUuid}/submit?parish=${parishSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        if (isNoActiveTermError(json)) {
          setNoActiveTerm(true);
          return;
        }
        setSubmitError(json.message ?? "Something went wrong. Please try again.");
        return;
      }

      submittedRef.current = true;
      setResult(json.data);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    } catch {
      setSubmitError("Unable to reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!active) return <Gate parishName={parishName} />;
  if (isLoading) return <p className="muted">Loading...</p>;
  if (noActiveTerm) return <div className="card panel"><NoActiveTermBanner /></div>;

  if (loadError || !exam) {
    return (
      <div className="card panel">
        <p>{loadError ?? "That exam couldn't be found."}</p>
        <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      </div>
    );
  }

  // Result screen
  if (result) {
    const circ = 2 * Math.PI * 62;
    const off = circ * (1 - result.percentage / 100);
    const col = result.passed ? "var(--sage)" : "var(--wine)";
    return (
      <div style={{ padding: "6px 0" }}>
        <div className="card result-card" style={{ maxWidth: 560, margin: "0 auto 22px" }}>
          <div className="eyebrow">{exam.title}</div>
          <div className="score-ring">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--limestone-deep)" strokeWidth="11" />
              <circle cx="70" cy="70" r="62" fill="none" stroke={col} strokeWidth="11" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 70 70)" />
            </svg>
            <div className="pct"><b>{result.percentage}%</b><span>{result.score}/{result.total_marks} marks</span></div>
          </div>
          <div className={`verdict ${result.passed ? "pass" : "fail"}`}>{result.passed ? "Passed \u2014 well done" : "Not passed yet"}</div>
          <p className="muted" style={{ margin: "0 auto 4px", maxWidth: 380 }}>
            {result.passed
              ? `You met the ${result.pass_mark}% pass mark for this module.`
              : `You need ${result.pass_mark}% to pass.${exam.allow_multiple_attempts && exam.window_open ? " The window is still open \u2014 you may try again." : ""}`}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <Link className="btn btn-ghost" href={`/${parishSlug}`}>Back to my courses</Link>
            {exam.allow_multiple_attempts && exam.window_open && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  exitCountRef.current = 0;
                  submittedRef.current = false;
                  setExamStarted(false);
                  load();
                }}
              >
                Take exam again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Not currently attemptable (window closed, already attempted single-attempt exam, etc.)
  if (!exam.can_attempt) {
    return (
      <div className="card panel" style={{ maxWidth: 560, margin: "30px auto" }}>
        <h2 style={{ fontSize: 17 }}>{exam.title}</h2>
        <p className="muted">
          {!exam.window_open
            ? "This exam window is not currently open."
            : "You have already attempted this exam."}
        </p>
        {exam.attempts.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, marginTop: 16 }}>Your attempts</h3>
            {exam.attempts.map((a, i) => (
              <div className="attempt-row" key={i}>
                <span>{new Date(a.submitted_at).toLocaleString()}</span>
                <Badge state={a.passed ? "active" : "closed"} />
                <b>{a.percentage}%</b>
              </div>
            ))}
          </>
        )}
        <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`} style={{ marginTop: 16 }}>&larr; My courses</Link>
      </div>
    );
  }

  // Start screen - the fullscreen request happens directly from this
  // button's onClick, which is what makes requestFullscreen() actually work.
  if (!examStarted) {
    return (
      <div ref={containerRef} className="card panel" style={{ maxWidth: 560, margin: "60px auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 19 }}>{exam.title}</h2>
        <p className="muted" style={{ margin: "10px 0 4px" }}>
          {exam.questions.length} question{exam.questions.length === 1 ? "" : "s"} &middot; Pass mark {exam.pass_mark}%
        </p>
        {exam.instructions && <p className="muted" style={{ maxWidth: 420, margin: "10px auto" }}>{exam.instructions}</p>}
        <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
          This exam opens in fullscreen. Leaving fullscreen or switching tabs during the exam is recorded.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={startExam}>
          Start exam
        </button>
      </div>
    );
  }

  // Active exam-taking screen
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      ref={containerRef}
      style={{
        margin: "-28px -28px 0",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="exam-head">
        <div className="mod">{exam.title}<small>Pass mark {exam.pass_mark}%</small></div>
        <div className="spacer" />
        <span className="badge b-open" style={{ background: "rgba(62,107,79,.25)", color: "#BFE6CC" }}>
          <span className="dot" style={{ background: "#BFE6CC" }} />Window open
        </span>
      </div>

      <div style={{ padding: 26, maxWidth: 760, margin: "0 auto", width: "100%" }}>
        <div className="page-head" style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ margin: 0 }}>
            {exam.questions.length} questions &middot; {answeredCount}/{exam.questions.length} answered
            {exam.allow_multiple_attempts && " \u00b7 You may retake while the window is open."}
          </p>
        </div>

        {exam.questions.map((q, i) => (
          <div className="card question" key={q.uuid}>
            <div className="qn">
              <div className="qnum">{i + 1}</div>
              <div><div className="qtext">{q.question_text}</div><div className="qmarks">{q.marks} mark{q.marks === 1 ? "" : "s"}</div></div>
            </div>
            <div role="radiogroup" aria-label={`Question ${i + 1}`}>
              {q.options.map((o) => (
                <div
                  key={o.uuid}
                  className={`opt${answers[q.uuid] === o.uuid ? " sel" : ""}`}
                  role="radio"
                  aria-checked={answers[q.uuid] === o.uuid}
                  tabIndex={0}
                  onClick={() => selectOption(q.uuid, o.uuid)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectOption(q.uuid, o.uuid);
                    }
                  }}
                >
                  <span className="rk" /><span>{o.option_text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {submitError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10, textAlign: "center" }}>{submitError}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit exam"}
          </button>
        </div>
      </div>

      {showExitWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
        >
          <div className="card result-card" style={{ maxWidth: 440, textAlign: "center" }}>
            <div className="verdict" style={{ color: "var(--wine)" }}>You left the exam</div>
            <p className="muted" style={{ margin: "10px auto 0", maxWidth: 360 }}>
              Leaving fullscreen or switching tabs during an exam is recorded. Return to the exam to continue &mdash; this incident has been logged and may be reviewed by your admin.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={resumeExam}>
              Return to exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
