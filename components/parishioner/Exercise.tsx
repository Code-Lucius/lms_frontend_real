"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SubBanner, Lozenge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";
import { isNoActiveTermError } from "@/lib/api-errors";
import { NoActiveTermBanner } from "@/components/ui/NoActiveTermBanner";
import Link from "next/link";

interface ExerciseQuestion {
  id: number;
  uuid: string;
  question_text: string;
  type: string;
  marks: number | null;
}

interface ExerciseData {
  uuid: string;
  instructions: string | null;
  due_date: string | null;
  module: { name: string | null };
  topic: { name: string | null };
  questions: ExerciseQuestion[];
}

interface SubmissionAnswer {
  question_id: number;
  answer_text: string | null;
}

interface Submission {
  id: number;
  status: string;
  answers?: SubmissionAnswer[];
}

export function Exercise({ uuid, parishName, parishSlug }: { uuid: string; parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [noActiveTerm, setNoActiveTerm] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termEndedWhileEditing, setTermEndedWhileEditing] = useState(false);

  const [pendingSaves, setPendingSaves] = useState(0);
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const init = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const startRes = await fetch(`/api/parishioner/exercise/${uuid}/start?parish=${parishSlug}`, {
        method: "POST",
        cache: "no-store",
      });

      if (startRes.status === 403) {
        setAlreadySubmitted(true);
        setIsLoading(false);
        return;
      }

      const startJson = await startRes.json();
      if (!startRes.ok) {
        if (isNoActiveTermError(startJson.message)) {
          setNoActiveTerm(true);
          setIsLoading(false);
          return;
        }
        setLoadError(startJson.message ?? "Failed to start this exercise.");
        setIsLoading(false);
        return;
      }

    setSubmission(startJson);
      const initialAnswers: Record<number, string> = {};
      (startJson.answers ?? []).forEach((a: SubmissionAnswer) => {
        if (a.answer_text != null) initialAnswers[a.question_id] = a.answer_text;
      });
      setAnswers(initialAnswers);

      const detailRes = await fetch(`/api/parishioner/exercise/${uuid}?parish=${parishSlug}`, {
        method: "POST",
        cache: "no-store",
      });
      const detailJson = await detailRes.json();
      if (!detailRes.ok) {
        setLoadError(detailJson.message ?? "Failed to load this exercise.");
        setIsLoading(false);
        return;
      }
      setExerciseData(detailJson.data);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid, parishSlug]);

  useEffect(() => {
    if (active) init();
  }, [active, init]);

  // async function saveAnswer(questionId: number, value: string) {
  //   if (!submission) return;
  //   setPendingSaves((n) => n + 1);
  //   try {
  //     await fetch(`/api/parishioner/exercise/${uuid}/save-answer?parish=${parishSlug}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         submission_id: submission.id,
  //         question_id: questionId,
  //         answer_text: value,
  //       }),
  //     });
  //   } catch {
  //     const msg = isNoActiveTermError(json.message)
  //       ? "This term has ended, so your answer can no longer be saved. Please contact your admin."
  //       : json.message ?? "Something went wrong.";
  //   } finally {
  //     setPendingSaves((n) => Math.max(0, n - 1));
  //   }
  // }

  async function saveAnswer(questionId: number, value: string) {
    if (!submission) return;
    setPendingSaves((n) => n + 1);
    try {
      const res = await fetch(`/api/parishioner/exercise/${uuid}/save-answer?parish=${parishSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submission.id,
          question_id: questionId,
          answer_text: value,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg = isNoActiveTermError(json)
          ? "This term has ended, so your answer can no longer be saved. Please contact your admin."
          : json.message ?? "Failed to save your answer.";
        if (isNoActiveTermError(json)) {
          setTermEndedWhileEditing(true);
        } else {
          // stay silent for ordinary autosave failures, matching original behavior
        }
        setSubmitError(msg); // or whatever error state field this component actually uses for this kind of message
      }
    } catch {
      setSubmitError("Unable to reach the server.");
    } finally {
      setPendingSaves((n) => Math.max(0, n - 1));
    }
  }

  function handleAnswerChange(questionId: number, value: string) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
    if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => saveAnswer(questionId, value), 900);
  }

  async function handleSubmit() {
    if (!submission) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parishioner/exercise/${uuid}/submit?parish=${parishSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submission.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Unable to reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!active) return <Gate parishName={parishName} />;

  if (isLoading) {
    return <p className="muted">Loading...</p>;
  }

  if (submitted || alreadySubmitted) {
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
  if (noActiveTerm) {
    return (
      <div className="card panel">
        <NoActiveTermBanner />
        <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      </div>
    );
  }
 

  if (loadError || !exerciseData) {
    return (
      <div className="card panel">
        <p>{loadError ?? "That exercise couldn't be found."}</p>
        <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/${parishSlug}`)}>&larr; My courses</button>
      </div>
    );
  }

  const dueLabel = exerciseData.due_date
    ? new Date(exerciseData.due_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head">
        <div className="eyebrow">
          {exerciseData.module.name ?? "Module"} &middot; {exerciseData.topic.name ?? "Topic"}
        </div>
        {/* No exercise title field in the backend response yet - kept as a placeholder */}
        <h1>Reflection on the Beatitudes</h1>
        <p>{exerciseData.instructions ?? "Answer each question in your own words. Your work saves automatically as you type."}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        {dueLabel && <span className="badge b-pending"><span className="dot" />Due {dueLabel}</span>}
        <span className={`save-ind${pendingSaves > 0 ? " saving" : ""}`}>
          <span className="dot" />{pendingSaves > 0 ? "Saving..." : "All answers saved"}
        </span>
      </div>

      {exerciseData.questions.map((q, i) => (
        <div className="card question" key={q.id}>
          <div className="qn">
            <div className="qnum">{i + 1}</div>
            <div>
              <div className="qtext">{q.question_text}</div>
              <div className="qmarks">{q.marks != null ? `${q.marks} mark${q.marks === 1 ? "" : "s"}` : "Short answer"}</div>
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <textarea
              placeholder="Write your reflection..."
              value={answers[q.id] ?? ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            />
          </div>
        </div>
      ))}

      {submitError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{submitError}</div>}

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn-ghost" onClick={() => router.push(`/${parishSlug}`)} disabled={submitting}>Save &amp; exit</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit for grading"}
        </button>
      </div>
    </>
  );
}