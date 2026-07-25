"use client";

import { useCallback, useEffect, useState } from "react";
import type { Course, Paginated, Region } from "@/lib/types";

export function Courses({ canManage }: { canManage: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const loadCourses = useCallback(async (p: number) => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/courses?page=${p}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load regions.");
        setCourses([]);
        return;
      }
      const paginated: Paginated<Course> = json.data;
      setCourses(paginated?.data ?? []);
      setPage(paginated?.current_page ?? 1);
      setLastPage(paginated?.last_page ?? 1);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses(1);
  }, [loadCourses]);

  function startCreate() {
    setEditing(null);
    setName("");
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(r: Course) {
    setEditing(r);
    setName(r.name);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const res = editing
        ? await fetch(`/api/courses/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          })
        : await fetch(`/api/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
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
      loadCourses(page);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(r: Course) {
    if (!window.confirm(`Delete "${r.name}"? Execises under it will also be removed. This can't be undone.`)) return;
    setDeletingUuid(r.uuid);
    try {
      const res = await fetch(`/api/courses/${r.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete region.");
        return;
      }
      if (editing?.uuid === r.uuid) startCreate();
      loadCourses(page);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Courses</h1>
        <p>The top level of the hierarchy. Deleting a region cascades to its deaneries per the schema.</p>
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>All Courses</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${courses.length} on this page`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Course</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {courses.length ? courses.map((r) => (
                <tr key={r.uuid}>
                  <td className="fw6">{r.name}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(r)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === r.uuid} onClick={() => handleDelete(r)}>
                        {deletingUuid === r.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && <tr><td colSpan={canManage ? 2 : 1} className="empty">No courses found.</td></tr>}
            </tbody>
          </table>

          {lastPage > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadCourses(page - 1)}>Previous</button>
              <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadCourses(page + 1)}>Next</button>
            </div>
          )}
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create course"}</h2>
            <div className="sub">{editing ? "Update its name below" : "Course names must be unique"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Course name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leadership" required disabled={isSaving} />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create course"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create course</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove courses.</p>
          </div>
        )}
      </div>
    </>
  );
}
