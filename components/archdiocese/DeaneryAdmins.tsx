"use client";

import { useCallback, useEffect, useState } from "react";
import { Person } from "@/components/ui";
import { useRegionOptions } from "@/hooks/useRegionOptions";
import type { Deanery, DeaneryAdminRecord, Paginated } from "@/lib/types";

const TYPE_OPTIONS = ["administrative", "academic"] as const;

export function DeaneryAdmins({ canManage }: { canManage: boolean }) {
  const { regions, isLoading: regionsLoading, error: regionsError } = useRegionOptions();

  const [admins, setAdmins] = useState<DeaneryAdminRecord[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<DeaneryAdminRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("academic");

  // Cascading picker state - deanery_uuid is what the backend actually needs.
  const [pickerRegion, setPickerRegion] = useState("");
  const [pickerDeaneries, setPickerDeaneries] = useState<Deanery[]>([]);
  const [pickerDeaneriesLoading, setPickerDeaneriesLoading] = useState(false);
  const [deaneryUuid, setDeaneryUuid] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const loadAdmins = useCallback(async (p: number) => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/deanery-admins?page=${p}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load deanery admins.");
        setAdmins([]);
        return;
      }
      const paginated: Paginated<DeaneryAdminRecord> = json.data;
      setAdmins(paginated?.data ?? []);
      setPage(paginated?.current_page ?? 1);
      setLastPage(paginated?.last_page ?? 1);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins(1);
  }, [loadAdmins]);

  // Whenever the picker's region changes, reload the deaneries within it.
  useEffect(() => {
    if (!pickerRegion) {
      setPickerDeaneries([]);
      setDeaneryUuid("");
      return;
    }
    let cancelled = false;
    setPickerDeaneriesLoading(true);
    fetch(`/api/deaneries?region=${pickerRegion}&page=1`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setPickerDeaneries(json.data?.data ?? []);
        setDeaneryUuid("");
      })
      .catch(() => {
        if (!cancelled) setPickerDeaneries([]);
      })
      .finally(() => {
        if (!cancelled) setPickerDeaneriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickerRegion]);

  function startCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setType("academic");
    setPickerRegion("");
    setDeaneryUuid("");
    setFormError(null);
    setFieldErrors({});
  }

  // As with region admins: the list endpoint only returns name/email/type,
  // so re-picking a deanery on edit isn't wired up until viewOne is confirmed
  // to include the deanery/region relationship.
  function startEdit(a: DeaneryAdminRecord) {
    setEditing(a);
    setName(a.name);
    setEmail(a.email);
    setType(a.type);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const body = editing ? { name, type } : { name, email, type, deanery_uuid: deaneryUuid };

      const res = editing
        ? await fetch(`/api/deanery-admins/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/deanery-admins`, {
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
      loadAdmins(page);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(a: DeaneryAdminRecord) {
    if (!window.confirm(`Remove ${a.name}? This can't be undone.`)) return;
    setDeletingUuid(a.uuid);
    try {
      const res = await fetch(`/api/deanery-admins/${a.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete deanery admin.");
        return;
      }
      if (editing?.uuid === a.uuid) startCreate();
      loadAdmins(page);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Deanery admins</h1>
        <p>Each deanery admin is assigned to one deanery. New admins receive an email to set their own password.</p>
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>All deanery admins</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${admins.length} on this page`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Admin</th><th>Type</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {admins.length ? admins.map((a) => (
                <tr key={a.uuid}>
                  <td><Person name={a.name} email={a.email} /></td>
                  <td><span className="slug-tag">{a.type}</span></td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(a)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === a.uuid} onClick={() => handleDelete(a)}>
                        {deletingUuid === a.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && <tr><td colSpan={canManage ? 3 : 2} className="empty">No deanery admins found.</td></tr>}
            </tbody>
          </table>

          {lastPage > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadAdmins(page - 1)}>Previous</button>
              <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadAdmins(page + 1)}>Next</button>
            </div>
          )}
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create deanery admin"}</h2>
            <div className="sub">{editing ? "Update their details below" : "They\u2019ll set their own password via an emailed link"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sr. Cecilia" required disabled={isSaving} />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              {!editing && (
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@archdiocese.org" required disabled={isSaving} />
                  {fieldErrors.email && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.email[0]}</div>}
                </div>
              )}

              <div className="field">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} disabled={isSaving}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {fieldErrors.type && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.type[0]}</div>}
              </div>

              {!editing && (
                <>
                  <div className="field">
                    <label>Region</label>
                    <select value={pickerRegion} onChange={(e) => setPickerRegion(e.target.value)} required disabled={isSaving || regionsLoading}>
                      <option value="" disabled>{regionsLoading ? "Loading regions\u2026" : "Select a region"}</option>
                      {regions.map((r) => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
                    </select>
                    {regionsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{regionsError}</div>}
                  </div>

                  <div className="field">
                    <label>Deanery</label>
                    <select value={deaneryUuid} onChange={(e) => setDeaneryUuid(e.target.value)} required disabled={isSaving || !pickerRegion || pickerDeaneriesLoading}>
                      <option value="" disabled>
                        {!pickerRegion ? "Select a region first" : pickerDeaneriesLoading ? "Loading deaneries\u2026" : "Select a deanery"}
                      </option>
                      {pickerDeaneries.map((d) => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
                    </select>
                    {pickerRegion && !pickerDeaneriesLoading && pickerDeaneries.length === 0 && (
                      <div className="muted" style={{ fontSize: 12 }}>No deaneries in this region yet &mdash; create one first under Deanery &rsaquo; Deaneries.</div>
                    )}
                    {fieldErrors.deanery_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.deanery_uuid[0]}</div>}
                  </div>
                </>
              )}

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || (!editing && !deaneryUuid)}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create & send invite"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create deanery admin</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove deanery admins.</p>
          </div>
        )}
      </div>
    </>
  );
}
