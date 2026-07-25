"use client";

import { useCallback, useEffect, useState } from "react";
import { Person } from "@/components/ui";
import { useRegionOptions } from "@/hooks/useRegionOptions";
import type { RegionAdminRecord, Paginated } from "@/lib/types";

const TYPE_OPTIONS = ["administrative", "academic"] as const;

export function RegionAdmins({ canManage }: { canManage: boolean }) {
  const { regions, isLoading: regionsLoading, error: regionsError } = useRegionOptions();

  const [admins, setAdmins] = useState<RegionAdminRecord[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<RegionAdminRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("academic");
  const [regionUuid, setRegionUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const loadAdmins = useCallback(async (p: number) => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/region-admins?page=${p}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load region admins.");
        setAdmins([]);
        return;
      }
      const paginated: Paginated<RegionAdminRecord> = json.data;
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

  function startCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setType("academic");
    setRegionUuid("");
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(a: RegionAdminRecord) {
    setEditing(a);
    setName(a.name);
    setEmail(a.email);
    setType(a.type);
    setRegionUuid(a.region?.uuid ?? "");
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
        ? { name, type, region_uuid: regionUuid }
        : { name, email, type, region_uuid: regionUuid };

        console.log(JSON.stringify(body));

      const res = editing
        ? await fetch(`/api/region-admins/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/region-admins`, {
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

  async function handleDelete(a: RegionAdminRecord) {
    if (!window.confirm(`Remove ${a.name}? This can't be undone.`)) return;
    setDeletingUuid(a.uuid);
    try {
      const res = await fetch(`/api/region-admins/${a.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete region admin.");
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
        <h1>Region admins</h1>
        <p>Each region admin is assigned to one region. New admins receive an email to set their own password.</p>
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>All region admins</h2>
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
              )) : !isLoading && <tr><td colSpan={canManage ? 3 : 2} className="empty">No region admins found.</td></tr>}
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
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create region admin"}</h2>
            <div className="sub">{editing ? "Update their details below" : "They\u2019ll set their own password via an emailed link"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fr. Emeka" required disabled={isSaving} />
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
                <div className="field">
                  <label>Region</label>
                  <select value={regionUuid} onChange={(e) => setRegionUuid(e.target.value)} required disabled={isSaving || regionsLoading}>
                    <option value="" disabled>{regionsLoading ? "Loading regions\u2026" : "Select a region"}</option>
                    {regions.map((r) => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
                  </select>
                  {regionsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{regionsError}</div>}
                  {regions.length === 0 && !regionsLoading && !regionsError && (
                    <div className="muted" style={{ fontSize: 12 }}>No regions yet &mdash; create one first under Region &rsaquo; Regions.</div>
                  )}
                  {fieldErrors.region_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.region_uuid[0]}</div>}
                </div>
              )}

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              {editing && <input type="hidden" name="region_uuid" value={regionUuid} />}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || (!editing && regions.length === 0)}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create & send invite"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create region admin</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove region admins.</p>
          </div>
        )}
      </div>
    </>
  );
}
