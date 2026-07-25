"use client";


import { useCallback, useEffect, useState } from "react";

import { useCourseOptions } from "@/hooks/useCourseOptions";

import type { Module, Paginated } from "@/lib/types";



export function Modules({ canManage }: { canManage: boolean }) {

  const { courses, isLoading: coursesLoading, error: coursesError } = useCourseOptions();



  const [selectedCourse, setSelectedCourse] = useState("");

  const [modules, setModules] = useState<Module[]>([]);

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const [listError, setListError] = useState<string | null>(null);



  const [editing, setEditing] = useState<Module | null>(null);

  const [name, setName] = useState("");

  const [passMark, setPassMark] = useState("70");

  const [formCourseUuid, setFormCourseUuid] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [isSaving, setIsSaving] = useState(false);

  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);



  // Default the course filter to the first course once courses load.

  useEffect(() => {

    if (!selectedCourse && courses.length > 0) {

      setSelectedCourse(courses[0].uuid);

      setFormCourseUuid(courses[0].uuid);

    }

  }, [courses, selectedCourse]);



  const loadModules = useCallback(async (course: string, p: number) => {

    if (!course) {

      setModules([]);

      return;

    }

    setIsLoading(true);

    setListError(null);

    try {

      const res = await fetch(`/api/modules?course=${course}&page=${p}`, { cache: "no-store" });

      const json = await res.json();

      if (!res.ok) {

        setListError(json.message ?? "Failed to load modules.");

        setModules([]);

        return;

      }

      const paginated: Paginated<Module> = json.data;

      setModules(paginated?.data ?? []);

      setPage(paginated?.current_page ?? 1);

      setLastPage(paginated?.last_page ?? 1);

    } catch {

      setListError("Unable to reach the server.");

    } finally {

      setIsLoading(false);

    }

  }, []);



  useEffect(() => {

    if (selectedCourse) loadModules(selectedCourse, 1);

  }, [selectedCourse, loadModules]);



  function startCreate() {

    setEditing(null);

    setName("");

    setPassMark("70");

    setFormCourseUuid(selectedCourse);

    setFormError(null);

    setFieldErrors({});

  }



  function startEdit(m: Module) {

    setEditing(m);

    setName(m.name);

    setPassMark(String(m.pass_mark));

    setFormCourseUuid(selectedCourse); // best guess - list doesn't return the module's course_uuid, and it's the course currently being browsed

    setFormError(null);

    setFieldErrors({});

  }



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setFormError(null);

    setFieldErrors({});

    setIsSaving(true);



    try {

      const body = { name, pass_mark: Number(passMark), course_uuid: formCourseUuid };

      const res = editing

        ? await fetch(`/api/modules/${editing.uuid}`, {

            method: "PUT",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(body),

          })

        : await fetch(`/api/modules`, {

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

      loadModules(selectedCourse, page);

    } catch {

      setFormError("Unable to reach the server.");

    } finally {

      setIsSaving(false);

    }

  }



  async function handleDelete(m: Module) {

    if (!window.confirm(`Delete "${m.name}"? This can't be undone.`)) return;

    setDeletingUuid(m.uuid);

    try {

      const res = await fetch(`/api/modules/${m.uuid}`, { method: "DELETE" });

      if (!res.ok) {

        const json = await res.json().catch(() => ({}));

        setListError(json.message ?? "Failed to delete module.");

        return;

      }

      if (editing?.uuid === m.uuid) startCreate();

      loadModules(selectedCourse, page);

    } catch {

      setListError("Unable to reach the server.");

    } finally {

      setDeletingUuid(null);

    }

  }



  return (

    <>

      <div className="page-head">

        <h1>Modules</h1>

        <p>Every module belongs to a course. Pick a course below to see and manage its modules.</p>

      </div>



      <div className="card panel" style={{ marginBottom: 18, maxWidth: 360 }}>

        <div className="field" style={{ marginBottom: 0 }}>

          <label>Course</label>

          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} disabled={coursesLoading}>

            <option value="" disabled>{coursesLoading ? "Loading courses\u2026" : "Select a course"}</option>

            {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}

          </select>

          {coursesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{coursesError}</div>}

          {courses.length === 0 && !coursesLoading && !coursesError && (

            <div className="muted" style={{ fontSize: 12 }}>No courses yet &mdash; create one first under Courses.</div>

          )}

        </div>

      </div>



      <div className="grid-2">

        <div className="card panel">

          <h2 style={{ fontSize: 17 }}>Modules in this course</h2>

          <div className="sub">{isLoading ? "Loading\u2026" : `${modules.length} on this page`}</div>



          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}



          <table className="tbl">

            <thead><tr><th>Module</th><th>Pass mark</th>{canManage && <th></th>}</tr></thead>

            <tbody>

              {modules.length ? modules.map((m) => (

                <tr key={m.uuid}>

                  <td className="fw6">{m.name}</td>

                  <td className="muted">{m.pass_mark}%</td>

                  {canManage && (

                    <td className="right">

                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(m)}>Edit</button>{" "}

                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === m.uuid} onClick={() => handleDelete(m)}>

                        {deletingUuid === m.uuid ? "Removing\u2026" : "Remove"}

                      </button>

                    </td>

                  )}

                </tr>

              )) : !isLoading && <tr><td colSpan={canManage ? 3 : 2} className="empty">{selectedCourse ? "No modules in this course yet." : "Select a course above."}</td></tr>}

            </tbody>

          </table>



          {lastPage > 1 && (

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>

              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadModules(selectedCourse, page - 1)}>Previous</button>

              <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>

              <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadModules(selectedCourse, page + 1)}>Next</button>

            </div>

          )}

        </div>



        {canManage ? (

          <div className="card panel">

            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create module"}</h2>

            <div className="sub">{editing ? "Update its details below" : "Assign it to a course and set its pass mark"}</div>



            <form onSubmit={handleSubmit}>

              <div className="field">

                <label>Module name</label>

                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Sacraments" required disabled={isSaving} />

                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}

              </div>



              <div className="field">

                <label>Pass mark (%)</label>

                <input type="number" min={0} max={100} value={passMark} onChange={(e) => setPassMark(e.target.value)} required disabled={isSaving} />

                {fieldErrors.pass_mark && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.pass_mark[0]}</div>}

              </div>



              <div className="field">

                <label>Course</label>

                <select value={formCourseUuid} onChange={(e) => setFormCourseUuid(e.target.value)} required disabled={isSaving || coursesLoading}>

                  <option value="" disabled>Select a course</option>

                  {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}

                </select>

                {fieldErrors.course_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.course_uuid[0]}</div>}

              </div>



              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}



              <div style={{ display: "flex", gap: 10 }}>

                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || courses.length === 0}>

                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create module"}

                </button>

                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}

              </div>

            </form>

          </div>

        ) : (

          <div className="card panel">

            <h2 style={{ fontSize: 17 }}>Create module</h2>

            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove modules.</p>

          </div>

        )}

      </div>

    </>

  );

}