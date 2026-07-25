"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCourseOptions } from "@/hooks/useCourseOptions";
import type { Module, Topic, Material, Paginated } from "@/lib/types";

const TYPE_OPTIONS = ["document", "video", "audio", "image"] as const;

export function Materials({ canManage }: { canManage: boolean }) {
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

  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Material | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("document");
  const [file, setFile] = useState<File | null>(null);
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
    setMaterials([]);
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
    setMaterials([]);
    if (selectedModule) loadTopicOptions(selectedModule);
  }, [selectedModule, loadTopicOptions]);

  useEffect(() => {
    if (!selectedTopic && topicOptions.length > 0) setSelectedTopic(topicOptions[0].uuid);
  }, [topicOptions, selectedTopic]);

  useEffect(() => {
    if (!editing) setFormTopicUuid(selectedTopic);
  }, [selectedTopic, editing]);

  const loadMaterials = useCallback(async (topicUuid: string) => {
    requestedTopicRef.current = topicUuid;

    if (!topicUuid) {
      setMaterials([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/materials?topic=${topicUuid}`, { cache: "no-store" });
      const json = await res.json();

      if (requestedTopicRef.current !== topicUuid) return;

      if (!res.ok) {
        setListError(json.message ?? "Failed to load materials.");
        setMaterials([]);
        return;
      }
      const paginated: Paginated<Material> = json.data;
      setMaterials(paginated?.data ?? []);
    } catch {
      if (requestedTopicRef.current !== topicUuid) return;
      setListError("Unable to reach the server.");
    } finally {
      if (requestedTopicRef.current === topicUuid) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTopic) loadMaterials(selectedTopic);
  }, [selectedTopic, loadMaterials]);

  function startCreate() {
    setEditing(null);
    setName("");
    setType("document");
    setFile(null);
    setFormTopicUuid(selectedTopic);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(m: Material) {
    setEditing(m);
    setName(m.name);
    setType(m.type);
    setFile(null);
    setFormTopicUuid(selectedTopic); // best guess - list doesn't return the material's own topic_uuid, and it's the topic currently being browsed
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("topic_uuid", formTopicUuid);
      if (file) formData.append("file", file); // required on create; optional on edit (only sent if replaced)

      const res = editing
        ? await fetch(`/api/materials/${editing.uuid}`, { method: "POST", body: formData })
        : await fetch(`/api/materials`, { method: "POST", body: formData });

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
      loadMaterials(selectedTopic);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(m: Material) {
    if (!window.confirm(`Delete "${m.name}"? This can't be undone.`)) return;
    setDeletingUuid(m.uuid);
    try {
      const res = await fetch(`/api/materials/${m.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete material.");
        return;
      }
      if (editing?.uuid === m.uuid) startCreate();
      loadMaterials(selectedTopic);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Materials</h1>
        <p>Every material belongs to a topic, which belongs to a module, which belongs to a course. Narrow down to a topic to see and manage its materials.</p>
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
          <h2 style={{ fontSize: 17 }}>Materials in this topic</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${materials.length} on this page`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Material</th><th>Type</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {materials.length ? materials.map((m) => (
                <tr key={m.uuid}>
                  <td className="fw6">{m.name}</td>
                  <td><span className="slug-tag">{m.type}</span></td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(m)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === m.uuid} onClick={() => handleDelete(m)}>
                        {deletingUuid === m.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && (
                <tr><td colSpan={canManage ? 3 : 2} className="empty">{selectedTopic ? "No materials in this topic yet." : "Select a course, module, and topic above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Upload material"}</h2>
            <div className="sub">{editing ? "Leave the file blank to keep the current one" : "Names must be unique"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Session 1 slides" required disabled={isSaving} />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} disabled={isSaving}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {fieldErrors.type && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.type[0]}</div>}
              </div>

              <div className="field">
                <label>File{editing ? " (optional \u2014 replaces current)" : ""}</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required={!editing}
                  disabled={isSaving}
                  accept=".pdf,.doc,.docx,.png,.jpg,.gif,.svg,.mp4,.mkv,.mp3,.wav"
                />
                {fieldErrors.file && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.file[0]}</div>}
              </div>

              <div className="field">
                <label>Topic</label>
                <select value={formTopicUuid} onChange={(e) => setFormTopicUuid(e.target.value)} required disabled={isSaving || topicsLoading}>
                  <option value="" disabled>Select a topic</option>
                  {topicOptions.map((t) => <option key={t.uuid} value={t.uuid}>{t.name}</option>)}
                </select>
                {fieldErrors.topic_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.topic_uuid[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || topicOptions.length === 0}>
                  {isSaving ? "Uploading\u2026" : editing ? "Save changes" : "Upload material"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Upload material</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can upload, edit, or remove materials.</p>
          </div>
        )}
      </div>
    </>
  );
}