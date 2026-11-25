"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCourseOptions } from "@/hooks/useCourseOptions";
import type { Module, ExamRecord, ExamQuestionRecord, ExamOption, Paginated } from "@/lib/types";

const EMPTY_OPTIONS = (): { text: string; isCorrect: boolean }[] => [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
];

export function Exam({ canManage }: { canManage: boolean }) {
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourseOptions();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [moduleOptions, setModuleOptions] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState("");

  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const requestedModuleRef = useRef<string>("");

  const [questions, setQuestions] = useState<ExamQuestionRecord[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Exam-level form
  const [editingExam, setEditingExam] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examInstructions, setExamInstructions] = useState("");
  const [examPassMark, setExamPassMark] = useState("50");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [examFormError, setExamFormError] = useState<string | null>(null);
  const [examFieldErrors, setExamFieldErrors] = useState<Record<string, string[]>>({});
  const [savingExam, setSavingExam] = useState(false);

  // Question-level form
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestionRecord | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState("1");
  const [options, setOptions] = useState(EMPTY_OPTIONS());
  const [qFormError, setQFormError] = useState<string | null>(null);
  const [qFieldErrors, setQFieldErrors] = useState<Record<string, string[]>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCourse && courses.length > 0) setSelectedCourse(courses[0].uuid);
  }, [courses, selectedCourse]);

  const loadModuleOptions = useCallback(async (course: string) => {
    if (!course) {
      setModuleOptions([]);
      return;
    }
    setModulesLoading(true);
    setModulesError(null);
    try {
      const res = await fetch(`/api/modules?course=${course}&page=1`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setModulesError(json.message ?? "Failed to load modules.");
        setModuleOptions([]);
        return;
      }
      const paginated: Paginated<Module> = json.data;
      setModuleOptions(paginated?.data ?? []);
    } catch {
      setModulesError("Unable to reach the server.");
    } finally {
      setModulesLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedModule("");
    setExam(null);
    setQuestions([]);
    if (selectedCourse) loadModuleOptions(selectedCourse);
  }, [selectedCourse, loadModuleOptions]);

  useEffect(() => {
    if (!selectedModule && moduleOptions.length > 0) setSelectedModule(moduleOptions[0].uuid);
  }, [moduleOptions, selectedModule]);

  const loadExam = useCallback(async (moduleUuid: string) => {
    requestedModuleRef.current = moduleUuid;
    if (!moduleUuid) {
      setExam(null);
      setQuestions([]);
      return;
    }
    setExamLoading(true);
    setExamError(null);
    try {
      const res = await fetch(`/api/exams?module=${moduleUuid}`, { cache: "no-store" });
      const json = await res.json();
      if (requestedModuleRef.current !== moduleUuid) return;
      if (!res.ok) {
        setExamError(json.message ?? "Failed to load exam.");
        setExam(null);
        return;
      }
      setExam(json.data ?? null);
    } catch {
      if (requestedModuleRef.current !== moduleUuid) return;
      setExamError("Unable to reach the server.");
    } finally {
      if (requestedModuleRef.current === moduleUuid) setExamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedModule) loadExam(selectedModule);
  }, [selectedModule, loadExam]);

  const loadQuestions = useCallback(async (examUuid: string) => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const res = await fetch(`/api/exam-questions?exam=${examUuid}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setQuestionsError(json.message ?? "Failed to load questions.");
        setQuestions([]);
        return;
      }
      setQuestions(Array.isArray(json.data) ? json.data : []);
    } catch {
      setQuestionsError("Unable to reach the server.");
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (exam?.uuid) loadQuestions(exam.uuid);
    else setQuestions([]);
  }, [exam?.uuid, loadQuestions]);

  function startExamCreate() {
    setEditingExam(true);
    setExamTitle("");
    setExamInstructions("");
    setExamPassMark("50");
    setAllowMultiple(false);
    setOpensAt("");
    setClosesAt("");
    setExamFormError(null);
    setExamFieldErrors({});
  }

  function startExamEdit() {
    if (!exam) return;
    setEditingExam(true);
    setExamTitle(exam.title);
    setExamInstructions(exam.instructions ?? "");
    setExamPassMark(String(exam.pass_mark));
    setAllowMultiple(exam.allow_multiple_attempts);
    setOpensAt(exam.opens_at ? exam.opens_at.slice(0, 16) : "");
    setClosesAt(exam.closes_at ? exam.closes_at.slice(0, 16) : "");
    setExamFormError(null);
    setExamFieldErrors({});
  }

  async function handleExamSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExamFormError(null);
    setExamFieldErrors({});
    setSavingExam(true);
    try {
      const body = exam
        ? {
            title: examTitle,
            instructions: examInstructions || null,
            pass_mark: Number(examPassMark),
            allow_multiple_attempts: allowMultiple,
            opens_at: opensAt || null,
            closes_at: closesAt || null,
          }
        : {
            title: examTitle,
            instructions: examInstructions || null,
            module_uuid: selectedModule,
            pass_mark: Number(examPassMark),
            allow_multiple_attempts: allowMultiple,
            opens_at: opensAt || null,
            closes_at: closesAt || null,
          };

      const res = exam
        ? await fetch(`/api/exams/${exam.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/exams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const json = await res.json();
      if (res.status === 422) {
        setExamFormError(json.message ?? "Validation failed.");
        setExamFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setExamFormError(json.message ?? "Something went wrong.");
        return;
      }

      setEditingExam(false);
      loadExam(selectedModule);
    } catch {
      setExamFormError("Unable to reach the server.");
    } finally {
      setSavingExam(false);
    }
  }

  function startQuestionCreate() {
    setEditingQuestion(null);
    setQuestionText("");
    setMarks("1");
    setOptions(EMPTY_OPTIONS());
    setQFormError(null);
    setQFieldErrors({});
  }

  function startQuestionEdit(q: ExamQuestionRecord) {
    setEditingQuestion(q);
    setQuestionText(q.question_text);
    setMarks(String(q.marks));
    setOptions(q.options.map((o) => ({ text: o.option_text, isCorrect: o.is_correct })));
    setQFormError(null);
    setQFieldErrors({});
  }

  function updateOptionText(i: number, text: string) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? { ...o, text } : o)));
  }

  function setCorrectOption(i: number) {
    setOptions((opts) => opts.map((o, idx) => ({ ...o, isCorrect: idx === i })));
  }

  function addOption() {
    setOptions((opts) => (opts.length < 6 ? [...opts, { text: "", isCorrect: false }] : opts));
  }

  function removeOption(i: number) {
    setOptions((opts) => {
      if (opts.length <= 2) return opts;
      const next = opts.filter((_, idx) => idx !== i);
      if (!next.some((o) => o.isCorrect)) next[0].isCorrect = true;
      return next;
    });
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQFormError(null);
    setQFieldErrors({});

    if (options.some((o) => !o.text.trim())) {
      setQFormError("Every option needs text.");
      return;
    }

    setSavingQuestion(true);
    try {
      const payload = {
        question_text: questionText,
        marks: Number(marks),
        options: options.map((o) => ({ option_text: o.text, is_correct: o.isCorrect })),
      };

      const res = editingQuestion
        ? await fetch(`/api/exam-questions/${editingQuestion.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/exam-questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, exam_uuid: exam!.uuid }),
          });

      const json = await res.json();
      if (res.status === 422) {
        setQFormError(json.message ?? "Validation failed.");
        setQFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setQFormError(json.message ?? "Something went wrong.");
        return;
      }

      startQuestionCreate();
      if (exam) loadQuestions(exam.uuid);
    } catch {
      setQFormError("Unable to reach the server.");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleQuestionDelete(q: ExamQuestionRecord) {
    if (!window.confirm(`Delete this question? This can't be undone.`)) return;
    setDeletingUuid(q.uuid);
    try {
      const res = await fetch(`/api/exam-questions/${q.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setQuestionsError(json.message ?? "Failed to delete question.");
        return;
      }
      if (editingQuestion?.uuid === q.uuid) startQuestionCreate();
      if (exam) loadQuestions(exam.uuid);
    } catch {
      setQuestionsError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Exams</h1>
        <p>Every exam belongs to one module. Pick a course and module to manage its exam and questions.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 480, display: "flex", gap: 16 }}>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading}>
            <option value="" disabled>{coursesLoading ? "Loading..." : "Select a course"}</option>
            {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
          {coursesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{coursesError}</div>}
        </div>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Module</label>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} disabled={modulesLoading || moduleOptions.length === 0}>
            <option value="" disabled>{modulesLoading ? "Loading..." : moduleOptions.length === 0 ? "No modules" : "Select a module"}</option>
            {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
          </select>
          {modulesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{modulesError}</div>}
        </div>
      </div>

      {examLoading ? (
        <p className="muted">Loading...</p>
      ) : !selectedModule ? (
        <p className="muted">Select a course and module above.</p>
      ) : examError ? (
        <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{examError}</div>
      ) : !exam && !editingExam ? (
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>No exam yet for this module</h2>
          {canManage ? (
            <>
              <p className="muted" style={{ fontSize: 13 }}>Create one to start adding questions.</p>
              <button className="btn btn-primary btn-sm" onClick={startExamCreate}>Create exam</button>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create exams.</p>
          )}
        </div>
      ) : editingExam ? (
        <div className="card panel" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: 17 }}>{exam ? "Edit exam" : "Create exam"}</h2>
          <form onSubmit={handleExamSubmit}>
            <div className="field">
              <label>Title</label>
              <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} required disabled={savingExam} />
              {examFieldErrors.title && <div style={{ color: "#b91c1c", fontSize: 12 }}>{examFieldErrors.title[0]}</div>}
            </div>
            <div className="field">
              <label>Instructions</label>
              <input value={examInstructions} onChange={(e) => setExamInstructions(e.target.value)} disabled={savingExam} />
            </div>
            <div className="field">
              <label>Pass mark</label>
              <input type="number" min={0} value={examPassMark} onChange={(e) => setExamPassMark(e.target.value)} required disabled={savingExam} />
              {examFieldErrors.pass_mark && <div style={{ color: "#b91c1c", fontSize: 12 }}>{examFieldErrors.pass_mark[0]}</div>}
            </div>
            <div className="field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="allowMultiple" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} disabled={savingExam} />
              <label htmlFor="allowMultiple" style={{ marginBottom: 0 }}>Allow multiple attempts</label>
            </div>
            <div className="field">
              <label>Opens at</label>
              <input type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} disabled={savingExam} />
            </div>
            <div className="field">
              <label>Closes at</label>
              <input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} disabled={savingExam} />
              {examFieldErrors.closes_at && <div style={{ color: "#b91c1c", fontSize: 12 }}>{examFieldErrors.closes_at[0]}</div>}
            </div>
            {examFormError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{examFormError}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingExam}>
                {savingExam ? "Saving..." : exam ? "Save changes" : "Create exam"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingExam(false)} disabled={savingExam}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        exam && (
          <>
            <div className="card panel" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: 17 }}>{exam.title}</h2>
                  <div className="sub">
                    Pass mark {exam.pass_mark} &middot; {exam.allow_multiple_attempts ? "Multiple attempts allowed" : "Single attempt"}
                    {exam.opens_at && <> &middot; Opens {new Date(exam.opens_at).toLocaleString()}</>}
                    {exam.closes_at && <> &middot; Closes {new Date(exam.closes_at).toLocaleString()}</>}
                  </div>
                </div>
                {canManage && <button className="btn btn-ghost btn-sm" onClick={startExamEdit}>Edit exam</button>}
              </div>
            </div>

            <div className="grid-2">
              <div className="card panel">
                <h2 style={{ fontSize: 17 }}>Questions</h2>
                <div className="sub">{questionsLoading ? "Loading..." : `${questions.length} question${questions.length === 1 ? "" : "s"}`}</div>
                {questionsError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{questionsError}</div>}
                <table className="tbl">
                  <thead><tr><th>Question</th><th>Marks</th>{canManage && <th></th>}</tr></thead>
                  <tbody>
                    {questions.length ? questions.map((q) => (
                      <tr key={q.uuid}>
                        <td className="fw6">{q.question_text}</td>
                        <td className="muted">{q.marks}</td>
                        {canManage && (
                          <td className="right">
                            <button className="btn btn-ghost btn-sm" onClick={() => startQuestionEdit(q)}>Edit</button>{" "}
                            <button className="btn btn-ghost btn-sm" disabled={deletingUuid === q.uuid} onClick={() => handleQuestionDelete(q)}>
                              {deletingUuid === q.uuid ? "Removing..." : "Remove"}
                            </button>
                          </td>
                        )}
                      </tr>
                    )) : !questionsLoading && <tr><td colSpan={canManage ? 3 : 2} className="empty">No questions yet.</td></tr>}
                  </tbody>
                </table>
              </div>

              {canManage ? (
                <div className="card panel">
                  <h2 style={{ fontSize: 17 }}>{editingQuestion ? "Edit question" : "Add question"}</h2>
                  <form onSubmit={handleQuestionSubmit}>
                    <div className="field">
                      <label>Question text</label>
                      <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} required disabled={savingQuestion} />
                      {qFieldErrors.question_text && <div style={{ color: "#b91c1c", fontSize: 12 }}>{qFieldErrors.question_text[0]}</div>}
                    </div>
                    <div className="field">
                      <label>Marks</label>
                      <input type="number" min={1} value={marks} onChange={(e) => setMarks(e.target.value)} required disabled={savingQuestion} />
                      {qFieldErrors.marks && <div style={{ color: "#b91c1c", fontSize: 12 }}>{qFieldErrors.marks[0]}</div>}
                    </div>

                    <label style={{ display: "block", marginBottom: 6 }}>Options (mark the correct one)</label>
                    {options.map((opt, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(i)}
                          disabled={savingQuestion}
                        />
                        <input
                          value={opt.text}
                          onChange={(e) => updateOptionText(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          style={{ flex: 1 }}
                          disabled={savingQuestion}
                        />
                        {options.length > 2 && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeOption(i)} disabled={savingQuestion}>
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {options.length < 6 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addOption} disabled={savingQuestion} style={{ marginBottom: 14 }}>
                        + Add option
                      </button>
                    )}

                    {qFormError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{qFormError}</div>}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={savingQuestion}>
                        {savingQuestion ? "Saving..." : editingQuestion ? "Save changes" : "Add question"}
                      </button>
                      {editingQuestion && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={startQuestionCreate} disabled={savingQuestion}>Cancel</button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card panel">
                  <p className="muted" style={{ fontSize: 13 }}>Only super admins can manage exam questions.</p>
                </div>
              )}
            </div>
          </>
        )
      )}
    </>
  );
}