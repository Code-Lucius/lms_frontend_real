"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCourseOptions } from "@/hooks/useCourseOptions";
import type { Module, Topic, Exercise, Question, Paginated } from "@/lib/types";

export function Questions({ canManage }: { canManage: boolean }) {
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourseOptions();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [moduleOptions, setModuleOptions] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState("");

  const [topicOptions, setTopicOptions] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("");

  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState("");
  const [formExerciseUuid, setFormExerciseUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const requestedExerciseRef = useRef<string>("");

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
    setTopicOptions([]);
    setSelectedTopic("");
    setExerciseOptions([]);
    setSelectedExercise("");
    setQuestions([]);
    if (selectedCourse) loadModuleOptions(selectedCourse);
  }, [selectedCourse, loadModuleOptions]);

  useEffect(() => {
    if (!selectedModule && moduleOptions.length > 0) setSelectedModule(moduleOptions[0].uuid);
  }, [moduleOptions, selectedModule]);

  const loadTopicOptions = useCallback(async (moduleUuid: string) => {
    if (!moduleUuid) {
      setTopicOptions([]);
      return;
    }
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const res = await fetch(`/api/topics?module=${moduleUuid}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setTopicsError(json.message ?? "Failed to load topics.");
        setTopicOptions([]);
        return;
      }
      const paginated: Paginated<Topic> = json.data;
      setTopicOptions(paginated?.data ?? []);
    } catch {
      setTopicsError("Unable to reach the server.");
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedTopic("");
    setExerciseOptions([]);
    setSelectedExercise("");
    setQuestions([]);
    if (selectedModule) loadTopicOptions(selectedModule);
  }, [selectedModule, loadTopicOptions]);

  useEffect(() => {
    if (!selectedTopic && topicOptions.length > 0) setSelectedTopic(topicOptions[0].uuid);
  }, [topicOptions, selectedTopic]);

  const loadExerciseOptions = useCallback(async (topicUuid: string) => {
    if (!topicUuid) {
      setExerciseOptions([]);
      return;
    }
    setExercisesLoading(true);
    setExercisesError(null);
    try {
      const res = await fetch(`/api/exercises?topic=${topicUuid}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setExercisesError(json.message ?? "Failed to load exercises.");
        setExerciseOptions([]);
        return;
      }
      const paginated: Paginated<Exercise> = json.data;
      setExerciseOptions(paginated?.data ?? []);
    } catch {
      setExercisesError("Unable to reach the server.");
    } finally {
      setExercisesLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedExercise("");
    setQuestions([]);
    if (selectedTopic) loadExerciseOptions(selectedTopic);
  }, [selectedTopic, loadExerciseOptions]);

  useEffect(() => {
    if (!selectedExercise && exerciseOptions.length > 0) setSelectedExercise(exerciseOptions[0].uuid);
  }, [exerciseOptions, selectedExercise]);

  useEffect(() => {
    if (!editing) setFormExerciseUuid(selectedExercise);
  }, [selectedExercise, editing]);

  // Note: this endpoint returns a flat array under `questions`, not a
  // paginated `data` shape like every other list endpoint in this app.
  const loadQuestions = useCallback(async (exerciseUuid: string) => {
    requestedExerciseRef.current = exerciseUuid;

    if (!exerciseUuid) {
      setQuestions([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/questions?exercise=${exerciseUuid}`, { cache: "no-store" });
      const json = await res.json();

      if (requestedExerciseRef.current !== exerciseUuid) return;

      if (!res.ok) {
        setListError(json.message ?? "Failed to load questions.");
        setQuestions([]);
        return;
      }
      setQuestions(Array.isArray(json.questions) ? json.questions : []);
    } catch {
      if (requestedExerciseRef.current !== exerciseUuid) return;
      setListError("Unable to reach the server.");
    } finally {
      if (requestedExerciseRef.current === exerciseUuid) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedExercise) loadQuestions(selectedExercise);
  }, [selectedExercise, loadQuestions]);

  function startCreate() {
    setEditing(null);
    setQuestionText("");
    setMarks("");
    setFormExerciseUuid(selectedExercise);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(q: Question) {
    setEditing(q);
    setQuestionText(q.question_text);
    setMarks(q.marks != null ? String(q.marks) : "");
    setFormExerciseUuid(selectedExercise); // best guess - list doesn't return the question's own exercise_uuid, and it's the exercise currently being browsed
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const body = editing
        ? { question_text: questionText, marks: marks === "" ? null : Number(marks) }
        : { question_text: questionText, marks: marks === "" ? null : Number(marks), exercise_uuid: formExerciseUuid };

      const res = editing
        ? await fetch(`/api/questions/${editing.uuid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const json = await res.json();

      if (res.status === 422) {
        setFormError(json.message ?? "Validation failed.");
        setFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setFormError(json.message ?? "Something went wrong.");
        return;
      }

      startCreate();
      loadQuestions(selectedExercise);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(q: Question) {
    if (!window.confirm(`Delete this question? This can't be undone.`)) return;
    setDeletingUuid(q.uuid);
    try {
      const res = await fetch(`/api/questions/${q.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete question.");
        return;
      }
      if (editing?.uuid === q.uuid) startCreate();
      loadQuestions(selectedExercise);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Questions</h1>
        <p>Every question belongs to an exercise. Narrow down to an exercise to see and manage its questions.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 800, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading}>
            <option value="" disabled>{coursesLoading ? "Loading\u2026" : "Select a course"}</option>
            {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
          {coursesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{coursesError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
          <label>Module</label>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} disabled={modulesLoading || moduleOptions.length === 0}>
            <option value="" disabled>{modulesLoading ? "Loading\u2026" : moduleOptions.length === 0 ? "No modules" : "Select a module"}</option>
            {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
          </select>
          {modulesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{modulesError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
          <label>Topic</label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} disabled={topicsLoading || topicOptions.length === 0}>
            <option value="" disabled>{topicsLoading ? "Loading\u2026" : topicOptions.length === 0 ? "No topics" : "Select a topic"}</option>
            {topicOptions.map((t) => <option key={t.uuid} value={t.uuid}>{t.name}</option>)}
          </select>
          {topicsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{topicsError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
          <label>Exercise</label>
          <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} disabled={exercisesLoading || exerciseOptions.length === 0}>
            <option value="" disabled>{exercisesLoading ? "Loading\u2026" : exerciseOptions.length === 0 ? "No exercises" : "Select an exercise"}</option>
            {exerciseOptions.map((ex) => <option key={ex.uuid} value={ex.uuid}>{ex.title}</option>)}
          </select>
          {exercisesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{exercisesError}</div>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>Questions in this exercise</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${questions.length} question${questions.length === 1 ? "" : "s"}`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Question</th><th>Marks</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {questions.length ? questions.map((q) => (
                <tr key={q.uuid}>
                  <td className="fw6">{q.question_text}</td>
                  <td className="muted">{q.marks ?? "\u2014"}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(q)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === q.uuid} onClick={() => handleDelete(q)}>
                        {deletingUuid === q.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && (
                <tr><td colSpan={canManage ? 3 : 2} className="empty">{selectedExercise ? "No questions in this exercise yet." : "Select a course, module, topic, and exercise above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? "Edit question" : "Create question"}</h2>
            <div className="sub">{editing ? "Update its details below" : "Assign it to an exercise"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Question text</label>
                <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="e.g. What does 'poor in spirit' mean to you?" required disabled={isSaving} />
                {fieldErrors.question_text && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.question_text[0]}</div>}
              </div>

              <div className="field">
                <label>Marks</label>
                <input type="number" min={0} value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Optional" disabled={isSaving} />
                {fieldErrors.marks && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.marks[0]}</div>}
              </div>

              {!editing && (
                <div className="field">
                  <label>Exercise</label>
                  <select value={formExerciseUuid} onChange={(e) => setFormExerciseUuid(e.target.value)} required disabled={isSaving || exercisesLoading}>
                    <option value="" disabled>Select an exercise</option>
                    {exerciseOptions.map((ex) => <option key={ex.uuid} value={ex.uuid}>{ex.title}</option>)}
                  </select>
                  {fieldErrors.exercise_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.exercise_uuid[0]}</div>}
                </div>
              )}

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || exerciseOptions.length === 0}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create question"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create question</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove questions.</p>
          </div>
        )}
      </div>
    </>
  );
}