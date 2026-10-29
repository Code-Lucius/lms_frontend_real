"use client";

import { useEffect, useMemo, useState } from "react";
import { SubBanner, Badge } from "@/components/ui";
import { useSubscription } from "@/lib/subscription";
import type { ModuleResult, ExamResult, ExerciseResult } from "@/lib/types";

function formatScore(value: number) {
  return Number(value).toFixed(1).replace(/\.0$/, "");
}

function formatStored(value: string | null) {
  if (!value) return "—";
  const d = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime ? `${date}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : date;
}

function useResults<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.message ?? "Failed to load.");
          setData([]);
        } else {
          setData(json.data ?? []);
        }
      } catch {
        if (!cancelled) setError("Unable to reach the server.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, isLoading, error };
}

function courseOptions<T extends { course_uuid: string; course_name: string }>(rows: T[]) {
  const map = new Map<string, string>();
  rows.forEach((r) => map.set(r.course_uuid, r.course_name));
  return Array.from(map, ([uuid, name]) => ({ uuid, name }));
}

function CourseFilter({
  options,
  value,
  onChange,
}: {
  options: { uuid: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (options.length < 2) return null;
  return (
    <select
      className="field"
      style={{ margin: 0, width: "auto", padding: "9px 12px" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by course"
    >
      <option value="">All courses</option>
      {options.map((o) => <option key={o.uuid} value={o.uuid}>{o.name}</option>)}
    </select>
  );
}

const errorStyle = { color: "#b91c1c", fontSize: 12.5, margin: "8px 0" } as const;

export function Results({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();
  console.log(parishSlug)
  console.log(parishName)
  const modules = useResults<ModuleResult>(`/api/my-results?parish=${parishSlug}`);
  const exams = useResults<ExamResult>(`/api/my-exam-results?parish=${parishSlug}`);
  const exercises = useResults<ExerciseResult>(`/api/my-exercise-results?parish=${parishSlug}`);

  const [examCourse, setExamCourse] = useState("");
  const [exerciseCourse, setExerciseCourse] = useState("");

  const examCourses = useMemo(() => courseOptions(exams.data), [exams.data]);
  const exerciseCourses = useMemo(() => courseOptions(exercises.data), [exercises.data]);

  const visibleExams = useMemo(
    () => (examCourse ? exams.data.filter((r) => r.course_uuid === examCourse) : exams.data),
    [exams.data, examCourse]
  );
  const visibleExercises = useMemo(
    () => (exerciseCourse ? exercises.data.filter((r) => r.course_uuid === exerciseCourse) : exercises.data),
    [exercises.data, exerciseCourse]
  );

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head"><h1>My results</h1><p>Your module scores, exercise grades, and exam history in one place.</p></div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17 }}>Module scores</h2>
        <div className="sub">Final score per module, compared against its pass mark</div>
        {modules.error && <div role="alert" style={errorStyle}>{modules.error}</div>}
        <table className="tbl">
          <thead>
            <tr><th>Module</th><th>Term</th><th>Pass mark</th><th>Result</th><th className="right">Score</th></tr>
          </thead>
          <tbody>
            {modules.isLoading ? (
              <tr><td colSpan={5} className="empty">Loading…</td></tr>
            ) : modules.data.length ? modules.data.map((r, i) => (
              <tr key={`${r.module_uuid}-${r.term_name}-${i}`}>
                <td className="fw5">{r.module_name}<div className="muted" style={{ fontSize: 12 }}>{r.course_name}</div></td>
                <td className="muted">{r.term_name ?? "—"}</td>
                <td className="muted">{r.pass_mark}%</td>
                <td>
                  <span className={`badge ${r.passed ? "b-active" : "b-closed"}`}>
                    <span className="dot" />{r.passed ? "Passed" : "Not yet passed"}
                  </span>
                </td>
                <td className="right fw6">{formatScore(r.final_percentage)}%</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="empty">No module scores yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 17 }}>Exercises</h2>
            <div className="sub">Graded by your region admin</div>
          </div>
          <div className="spacer" />
          <CourseFilter options={exerciseCourses} value={exerciseCourse} onChange={setExerciseCourse} />
        </div>
        {exercises.error && <div role="alert" style={errorStyle}>{exercises.error}</div>}
        <table className="tbl">
          <thead>
            <tr><th>Exercise</th><th>Due</th><th>Status</th><th className="right">Score</th></tr>
          </thead>
          <tbody>
            {exercises.isLoading ? (
              <tr><td colSpan={4} className="empty">Loading…</td></tr>
            ) : visibleExercises.length ? visibleExercises.map((r) => (
              <tr key={r.exercise_uuid}>
                <td className="fw5">{r.title}<div className="muted" style={{ fontSize: 12 }}>{r.module_name} · {r.course_name}</div></td>
                <td className="muted">{formatStored(r.due_date)}</td>
                <td><Badge state={r.status} /></td>
                <td className="right fw6">
                  {r.score === null ? "—" : r.total_marks ? `${r.score}/${r.total_marks}` : r.score}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="empty">No submitted exercises{exerciseCourse ? " for this course" : ""} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card panel">
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 17 }}>Exam results</h2>
            <div className="sub">Your best attempt per module, per term</div>
          </div>
          <div className="spacer" />
          <CourseFilter options={examCourses} value={examCourse} onChange={setExamCourse} />
        </div>
        {exams.error && <div role="alert" style={errorStyle}>{exams.error}</div>}
        <table className="tbl">
          <thead>
            <tr><th>Module</th><th>Exam</th><th>Term</th><th>Submitted</th><th>Result</th><th className="right">Score</th></tr>
          </thead>
          <tbody>
            {exams.isLoading ? (
              <tr><td colSpan={6} className="empty">Loading…</td></tr>
            ) : visibleExams.length ? visibleExams.map((r, i) => (
              <tr key={`${r.module_uuid}-${r.term_name}-${i}`}>
                <td className="fw5">{r.module_name}<div className="muted" style={{ fontSize: 12 }}>{r.course_name}</div></td>
                <td className="muted">{r.exam_title}</td>
                <td className="muted">{r.term_name ?? "—"}</td>
                <td className="muted">{formatStored(r.submitted_at)}</td>
                <td>
                  <span className={`badge ${r.passed ? "b-active" : "b-closed"}`}>
                    <span className="dot" />{r.passed ? "Passed" : "Not yet passed"}
                  </span>
                </td>
                <td className="right fw6">{r.score}/{r.total_marks} · {formatScore(r.percentage)}%</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="empty">No exam attempts{examCourse ? " for this course" : ""} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}