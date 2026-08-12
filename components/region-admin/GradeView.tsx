"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { IconCheck } from "@/components/icons";

interface GradeRecord {
  id: number;
  answer_id: number;
  score: number;
  feedback: string | null;
}

interface QuestionRecord {
  id: number;
  exercise_id: number;
  question_text: string;
  marks: number | null;
}

interface AnswerRecord {
  id: number;
  question_id: number;
  answer_text: string | null;
  question: QuestionRecord;
  grade: GradeRecord | null;
}

interface SubmissionRecord {
  id: number;
  status: string;
  submitted_at: string | null;
  exercise: { uuid: string; title: string };
  parishioner: { first_name: string; middle_name: string | null; last_name: string };
  answers: AnswerRecord[];
}

export function GradeView({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});

  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/region-admin/submission/${submissionId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setLoadError(json.message ?? "That submission couldn't be found.");
        return;
      }
      const data: SubmissionRecord = json.data;
      setSubmission(data);

      const initialScores: Record<number, string> = {};
      const initialFeedback: Record<number, string> = {};
      const alreadyGraded = new Set<number>();
      data.answers.forEach((a) => {
        if (a.grade) {
          initialScores[a.id] = String(a.grade.score);
          initialFeedback[a.id] = a.grade.feedback ?? "";
          alreadyGraded.add(a.id);
        }
      });
      setScores(initialScores);
      setFeedbacks(initialFeedback);
      setSavedIds(alreadyGraded);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveGrade(answerId: number) {
    setSaveErrors((e) => ({ ...e, [answerId]: "" }));
    setSavingId(answerId);
    try {
      const res = await fetch(`/api/region-admin/grade-answer/${submissionId}/${answerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(scores[answerId] ?? 0),
          feedback: feedbacks[answerId] || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveErrors((e) => ({ ...e, [answerId]: json.message ?? "Failed to save this grade." }));
        return;
      }
      setSavedIds((s) => new Set(s).add(answerId));
    } catch {
      setSaveErrors((e) => ({ ...e, [answerId]: "Unable to reach the server." }));
    } finally {
      setSavingId(null);
    }
  }

  async function closeSubmission() {
    setCloseError(null);
    setIsClosing(true);
    try {
      const res = await fetch(`/api/region-admin/close-submission/${submissionId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setCloseError(json.message ?? "Failed to close this submission.");
        return;
      }
      // Backend is now the source of truth for status - this is what
      // actually reveals the "Grade saved" screen below.
      setSubmission((prev) => (prev ? { ...prev, status: json.data?.status ?? "graded" } : prev));
    } catch {
      setCloseError("Unable to reach the server.");
    } finally {
      setIsClosing(false);
    }
  }

  if (isLoading) return <p className="muted">Loading\u2026</p>;

  if (loadError || !submission) {
    return (
      <div className="card panel">
        <p>{loadError ?? "That submission couldn't be found."}</p>
        <Link className="btn btn-ghost btn-sm" href="/region-admin">&larr; Back to queue</Link>
      </div>
    );
  }

  const parishionerName = [
    submission.parishioner.first_name,
    submission.parishioner.middle_name,
    submission.parishioner.last_name,
  ].filter(Boolean).join(" ");

  const allAnswersSaved = submission.answers.length > 0 && submission.answers.every((a) => savedIds.has(a.id));

  // Success screen is now driven entirely by real submission status, not
  // client-side save tracking.
  if (submission.status === "graded") {
    return (
      <div className="card result-card" style={{ maxWidth: 480, margin: "40px auto" }}>
        <div className="icon" style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--sage-soft)", color: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <IconCheck width={28} height={28} />
        </div>
        <div className="verdict pass">Grade saved</div>
        <p className="muted" style={{ margin: "0 auto", maxWidth: 340 }}>The score is now visible to the parishioner and to parish &amp; deanery admins.</p>
        <Link className="btn btn-ghost" style={{ marginTop: 20 }} href="/region-admin">Back to queue</Link>
      </div>
    );
  }

  return (
    <>
      <Link className="btn btn-ghost btn-sm" href="/region-admin">&larr; Back to queue</Link>
      <div className="page-head" style={{ marginTop: 16 }}>
        <div className="eyebrow">
          {submission.exercise.title} &middot; {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "\u2014"}
        </div>
        <h1>{submission.exercise.title}</h1>
        <p>Grading for <b style={{ color: "var(--ink)" }}>{parishionerName}</b> &middot; <Badge state={submission.status} /></p>
      </div>

      {submission.answers.map((a, i) => {
        const maxMark = a.question.marks ?? 100;
        const isSaved = savedIds.has(a.id);
        return (
          <div className="card question" key={a.id}>
            <div className="qn">
              <div className="qnum">{i + 1}</div>
              <div><div className="qtext">{a.question.question_text}</div></div>
            </div>
            <div style={{ background: "var(--limestone)", border: "1px solid var(--border)", borderRadius: 11, padding: "14px 16px", fontSize: 14, lineHeight: 1.55, marginBottom: 14, color: "var(--ink)" }}>
              {a.answer_text || <span className="muted">No answer submitted.</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="field" style={{ margin: 0, flex: "none", width: 130 }}>
                <label style={{ marginBottom: 5 }}>Marks (of {maxMark})</label>
                <input
                  type="number"
                  min={0}
                  max={maxMark}
                  value={scores[a.id] ?? ""}
                  onChange={(e) => setScores((s) => ({ ...s, [a.id]: e.target.value }))}
                  disabled={savingId === a.id}
                />
              </div>
              <div className="field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
                <label style={{ marginBottom: 5 }}>Comment (optional)</label>
                <input
                  placeholder="A note for the parishioner\u2026"
                  value={feedbacks[a.id] ?? ""}
                  onChange={(e) => setFeedbacks((f) => ({ ...f, [a.id]: e.target.value }))}
                  disabled={savingId === a.id}
                />
              </div>
              <button
                className="btn btn-brass btn-sm"
                onClick={() => saveGrade(a.id)}
                disabled={savingId === a.id || scores[a.id] === undefined || scores[a.id] === ""}
                style={{ alignSelf: "flex-end" }}
              >
                {savingId === a.id ? "Saving\u2026" : isSaved ? "Update grade" : "Save grade"}
              </button>
            </div>
            {isSaved && <div style={{ color: "var(--sage)", fontSize: 12.5, marginTop: 8 }}>Saved &#10003;</div>}
            {saveErrors[a.id] && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginTop: 8 }}>{saveErrors[a.id]}</div>}
          </div>
        );
      })}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginTop: 6 }}>
        {!allAnswersSaved && (
          <div className="muted" style={{ fontSize: 12.5 }}>Grade every question above before closing this submission.</div>
        )}
        {closeError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{closeError}</div>}
        <button
          className="btn btn-brass"
          onClick={closeSubmission}
          disabled={!allAnswersSaved || isClosing}
        >
          {isClosing ? "Closing\u2026" : "Close submission & release grade"}
        </button>
      </div>
    </>
  );
}