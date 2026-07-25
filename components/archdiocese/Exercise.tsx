"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCourseOptions } from "@/hooks/useCourseOptions";
import type { Module, Topic, Exercise, Paginated } from "@/lib/types";

export function Exercises({ canManage }: { canManage: boolean }) {
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

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Exercise | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formTopicUuid, setFormTopicUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const requestedTopicRef = useRef<string>("");

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
    setExercises([]);
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
    setExercises([]);
    if (selectedModule) loadTopicOptions(selectedModule);
  }, [selectedModule, loadTopicOptions]);

  useEffect(() => {
    if (!selectedTopic && topicOptions.length > 0) setSelectedTopic(topicOptions[0].uuid);
  }, [topicOptions, selectedTopic]);

  useEffect(() => {
    if (!editing) setFormTopicUuid(selectedTopic);
  }, [selectedTopic, editing]);

  const loadExercises = useCallback(async (topicUuid: string) => {
    requestedTopicRef.current = topicUuid;

    if (!topicUuid) {
      setExercises([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/exercises?topic=${topicUuid}`, { cache: "no-store" });
      const json = await res.json();

      if (requestedTopicRef.current !== topicUuid) return;

      if (!res.ok) {
        setListError(json.message ?? "Failed to load exercises.");
        setExercises([]);
        return;
      }
      const paginated: Paginated<Exercise> = json.data;
      setExercises(paginated?.data ?? []);
    } catch {
      if (requestedTopicRef.current !== topicUuid) return;
      setListError("Unable to reach the server.");
    } finally {
      if (requestedTopicRef.current === topicUuid) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTopic) loadExercises(selectedTopic);
  }, [selectedTopic, loadExercises]);

  function startCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setInstructions("");
    setDueDate("");
    setFormTopicUuid(selectedTopic);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(ex: Exercise) {
    setEditing(ex);
    setTitle(ex.title);
    setDescription(ex.description ?? "");
    setInstructions(ex.instructions ?? "");
    setDueDate(ex.due_date ?? "");
    setFormTopicUuid(selectedTopic); // best guess - list doesn't return the exercise's own topic_uuid, and it's the topic currently being browsed
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
        ? { title, description: description || null, instructions: instructions || null, due_date: dueDate || null }
        : { title, description: description || null, instructions: instructions || null, due_date: dueDate || null, topic_uuid: formTopicUuid };

      const res = editing
        ? await fetch(`/api/exercises/${editing.uuid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/exercises`, {
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
      loadExercises(selectedTopic);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(ex: Exercise) {
    if (!window.confirm(`Delete "${ex.title}"? This can't be undone.`)) return;
    setDeletingUuid(ex.uuid);
    try {
      const res = await fetch(`/api/exercises/${ex.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete exercise.");
        return;
      }
      if (editing?.uuid === ex.uuid) startCreate();
      loadExercises(selectedTopic);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Exercises</h1>
        <p>Every exercise belongs to a topic, which belongs to a module, which belongs to a course. Narrow down to a topic to see and manage its exercises.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 640, display: "flex", gap: 16 }}>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading}>
            <option value="" disabled>{coursesLoading ? "Loading\u2026" : "Select a course"}</option>
            {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
          {coursesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{coursesError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Module</label>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} disabled={modulesLoading || moduleOptions.length === 0}>
            <option value="" disabled>{modulesLoading ? "Loading\u2026" : moduleOptions.length === 0 ? "No modules" : "Select a module"}</option>
            {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
          </select>
          {modulesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{modulesError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Topic</label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} disabled={topicsLoading || topicOptions.length === 0}>
            <option value="" disabled>{topicsLoading ? "Loading\u2026" : topicOptions.length === 0 ? "No topics" : "Select a topic"}</option>
            {topicOptions.map((t) => <option key={t.uuid} value={t.uuid}>{t.name}</option>)}
          </select>
          {topicsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{topicsError}</div>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>Exercises in this topic</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${exercises.length} on this page`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Exercise</th><th>Due</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {exercises.length ? exercises.map((ex) => (
                <tr key={ex.uuid}>
                  <td className="fw6">{ex.title}</td>
                  <td className="muted">{ex.due_date ?? "\u2014"}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(ex)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === ex.uuid} onClick={() => handleDelete(ex)}>
                        {deletingUuid === ex.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && (
                <tr><td colSpan={canManage ? 3 : 2} className="empty">{selectedTopic ? "No exercises in this topic yet." : "Select a course, module, and topic above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.title}` : "Create exercise"}</h2>
            <div className="sub">{editing ? "Update its details below" : "Assign it to a topic"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reflect on the Beatitudes" required disabled={isSaving} />
                {fieldErrors.title && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.title[0]}</div>}
              </div>

              <div className="field">
                <label>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary (optional)" disabled={isSaving} />
                {fieldErrors.description && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.description[0]}</div>}
              </div>

              <div className="field">
                <label>Instructions</label>
                <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should the parishioner do? (optional)" disabled={isSaving} />
                {fieldErrors.instructions && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.instructions[0]}</div>}
              </div>

              <div className="field">
                <label>Due date</label>
                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isSaving} />
                {fieldErrors.due_date && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.due_date[0]}</div>}
              </div>

              {!editing && (
                <div className="field">
                  <label>Topic</label>
                  <select value={formTopicUuid} onChange={(e) => setFormTopicUuid(e.target.value)} required disabled={isSaving || topicsLoading}>
                    <option value="" disabled>Select a topic</option>
                    {topicOptions.map((t) => <option key={t.uuid} value={t.uuid}>{t.name}</option>)}
                  </select>
                  {fieldErrors.topic_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.topic_uuid[0]}</div>}
                </div>
              )}

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || topicOptions.length === 0}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create exercise"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create exercise</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove exercises.</p>
          </div>
        )}
      </div>
    </>
  );
}