"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCourseOptions } from "@/hooks/useCourseOptions";
import type { Module, Topic, Paginated } from "@/lib/types";

export function Topics({ canManage }: { canManage: boolean }) {
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourseOptions();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [moduleOptions, setModuleOptions] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState("");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Topic | null>(null);
  const [name, setName] = useState("");
  const [formModuleUuid, setFormModuleUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  // Guards against a slow, stale topics response overwriting a newer module selection's result.
  const requestedModuleRef = useRef<string>("");

  // Default the course filter to the first course once courses load.
  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0].uuid);
    }
  }, [courses, selectedCourse]);

  // Load the module dropdown options whenever the course changes.
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
    setSelectedModule(""); // reset downstream selection whenever course changes
    setTopics([]);
    if (selectedCourse) loadModuleOptions(selectedCourse);
  }, [selectedCourse, loadModuleOptions]);

  // Auto-select the first module once options load for the current course.
  useEffect(() => {
    if (!selectedModule && moduleOptions.length > 0) {
      setSelectedModule(moduleOptions[0].uuid);
    }
  }, [moduleOptions, selectedModule]);

  // Keep the create-form's module selection in step with the filter, unless editing.
  useEffect(() => {
    if (!editing) setFormModuleUuid(selectedModule);
  }, [selectedModule, editing]);

  const loadTopics = useCallback(async (moduleUuid: string) => {
    requestedModuleRef.current = moduleUuid;

    if (!moduleUuid) {
      setTopics([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/topics?module=${moduleUuid}`, { cache: "no-store" });
      const json = await res.json();

      if (requestedModuleRef.current !== moduleUuid) return; // stale response, discard

      if (!res.ok) {
        setListError(json.message ?? "Failed to load topics.");
        setTopics([]);
        return;
      }
      const paginated: Paginated<Topic> = json.data;
      setTopics(paginated?.data ?? []);
    } catch {
      if (requestedModuleRef.current !== moduleUuid) return;
      setListError("Unable to reach the server.");
    } finally {
      if (requestedModuleRef.current === moduleUuid) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedModule) loadTopics(selectedModule);
  }, [selectedModule, loadTopics]);

  function startCreate() {
    setEditing(null);
    setName("");
    setFormModuleUuid(selectedModule);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(t: Topic) {
    setEditing(t);
    setName(t.name);
    setFormModuleUuid(selectedModule); // best guess - list doesn't return the topic's own module_uuid, and it's the module currently being browsed
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const body = { name, module_uuid: formModuleUuid };
      const res = editing
        ? await fetch(`/api/topics/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/topics`, {
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
      loadTopics(selectedModule);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(t: Topic) {
    if (!window.confirm(`Delete "${t.name}"? This can't be undone.`)) return;
    setDeletingUuid(t.uuid);
    try {
      const res = await fetch(`/api/topics/${t.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete topic.");
        return;
      }
      if (editing?.uuid === t.uuid) startCreate();
      loadTopics(selectedModule);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Topics</h1>
        <p>Every topic belongs to a module, and every module belongs to a course. Pick a course, then a module, to see and manage its topics.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 480, display: "flex", gap: 16 }}>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading}>
            <option value="" disabled>{coursesLoading ? "Loading courses\u2026" : "Select a course"}</option>
            {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
          {coursesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{coursesError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            disabled={modulesLoading || moduleOptions.length === 0}
          >
            <option value="" disabled>
              {modulesLoading ? "Loading modules\u2026" : moduleOptions.length === 0 ? "No modules in this course" : "Select a module"}
            </option>
            {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
          </select>
          {modulesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{modulesError}</div>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>Topics in this module</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${topics.length} topic${topics.length === 1 ? "" : "s"}`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Topic</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {topics.length ? topics.map((t) => (
                <tr key={t.uuid}>
                  <td className="fw6">{t.name}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(t)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === t.uuid} onClick={() => handleDelete(t)}>
                        {deletingUuid === t.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && (
                <tr><td colSpan={canManage ? 2 : 1} className="empty">{selectedModule ? "No topics in this module yet." : "Select a course and module above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create topic"}</h2>
            <div className="sub">{editing ? "Update its details below" : "Topic names must be unique"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Topic name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Eucharist" required disabled={isSaving} />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label>Module</label>
                <select value={formModuleUuid} onChange={(e) => setFormModuleUuid(e.target.value)} required disabled={isSaving || modulesLoading}>
                  <option value="" disabled>Select a module</option>
                  {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
                </select>
                {fieldErrors.module_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.module_uuid[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || moduleOptions.length === 0}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create topic"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create topic</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove topics.</p>
          </div>
        )}
      </div>
    </>
  );
}