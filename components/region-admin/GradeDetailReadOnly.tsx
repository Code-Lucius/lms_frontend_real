"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

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

export function GradeDetailReadOnly({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      setSubmission(json.data);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <p className="muted">Loading\u2026</p>;

  if (loadError || !submission) {
    return (
      <div className="card panel">
        <p>{loadError ?? "That submission couldn't be found."}</p>
        <Link className="btn btn-ghost btn-sm" href="/region-admin/graded">&larr; Back to graded exercises</Link>
      </div>
    );
  }

  const parishionerName = [
    submission.parishioner.first_name,
    submission.parishioner.middle_name,
    submission.parishioner.last_name,
  ].filter(Boolean).join(" ");

  const totalScore = submission.answers.reduce((sum, a) => sum + (a.grade?.score ?? 0), 0);
  const totalMax = submission.answers.reduce((sum, a) => sum + (a.question.marks ?? 0), 0);

  return (
    <>
      <Link className="btn btn-ghost btn-sm" href="/region-admin/graded">&larr; Back to graded exercises</Link>
      <div className="page-head" style={{ marginTop: 16 }}>
        <div className="eyebrow">
          {submission.exercise.title} &middot; {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "\u2014"}
        </div>
        <h1>{submission.exercise.title}</h1>
        <p>
          Graded submission for <b style={{ color: "var(--ink)" }}>{parishionerName}</b> &middot; <Badge state={submission.status} />
          {totalMax > 0 && <> &middot; <b style={{ color: "var(--ink)" }}>{totalScore} / {totalMax}</b></>}
        </p>
      </div>

      {submission.answers.map((a, i) => (
        <div className="card question" key={a.id}>
          <div className="qn">
            <div className="qnum">{i + 1}</div>
            <div><div className="qtext">{a.question.question_text}</div></div>
          </div>
          <div style={{ background: "var(--limestone)", border: "1px solid var(--border)", borderRadius: 11, padding: "14px 16px", fontSize: 14, lineHeight: 1.55, marginBottom: 14, color: "var(--ink)" }}>
            {a.answer_text || <span className="muted">No answer submitted.</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <span className="fw6">{a.grade?.score ?? "\u2014"}</span>
              <span className="muted"> / {a.question.marks ?? "\u2014"}</span>
            </div>
            {a.grade?.feedback && (
              <div className="muted" style={{ fontSize: 13, flex: 1, minWidth: 200 }}>
                &ldquo;{a.grade.feedback}&rdquo;
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}