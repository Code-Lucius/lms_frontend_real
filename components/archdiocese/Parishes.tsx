"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRegionOptions } from "@/hooks/useRegionOptions";
import type { Deanery, Parish, Paginated } from "@/lib/types";

export function Parishes({ canManage }: { canManage: boolean }) {
  const { regions, isLoading: regionsLoading, error: regionsError } = useRegionOptions();

  const [selectedRegion, setSelectedRegion] = useState("");
  const [deaneryOptions, setDeaneryOptions] = useState<Deanery[]>([]);
  const [deaneriesLoading, setDeaneriesLoading] = useState(false);
  const [deaneriesError, setDeaneriesError] = useState<string | null>(null);
  const [selectedDeanery, setSelectedDeanery] = useState("");

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Parish | null>(null);
  const [parishName, setParishName] = useState("");
  const [parishSlug, setParishSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [formDeaneryUuid, setFormDeaneryUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const requestedDeaneryRef = useRef<string>("");

  useEffect(() => {
    if (!selectedRegion && regions.length > 0) {
      setSelectedRegion(regions[0].uuid);
    }
  }, [regions, selectedRegion]);

  const loadDeaneryOptions = useCallback(async (region: string) => {
    if (!region) {
      setDeaneryOptions([]);
      return;
    }
    setDeaneriesLoading(true);
    setDeaneriesError(null);
    try {
      const res = await fetch(`/api/deaneries?region=${region}&page=1`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setDeaneriesError(json.message ?? "Failed to load deaneries.");
        setDeaneryOptions([]);
        return;
      }
      const paginated: Paginated<Deanery> = json.data;
      setDeaneryOptions(paginated?.data ?? []);
    } catch {
      setDeaneriesError("Unable to reach the server.");
    } finally {
      setDeaneriesLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedDeanery("");
    setParishes([]);
    if (selectedRegion) loadDeaneryOptions(selectedRegion);
  }, [selectedRegion, loadDeaneryOptions]);

  useEffect(() => {
    if (!selectedDeanery && deaneryOptions.length > 0) {
      setSelectedDeanery(deaneryOptions[0].uuid);
    }
  }, [deaneryOptions, selectedDeanery]);

  useEffect(() => {
    if (!editing) setFormDeaneryUuid(selectedDeanery);
  }, [selectedDeanery, editing]);

  const loadParishes = useCallback(async (deaneryUuid: string) => {
    requestedDeaneryRef.current = deaneryUuid;

    if (!deaneryUuid) {
      setParishes([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/parishes?deanery=${deaneryUuid}`, { cache: "no-store" });
      const json = await res.json();

      if (requestedDeaneryRef.current !== deaneryUuid) return;

      if (!res.ok) {
        setListError(json.message ?? "Failed to load parishes.");
        setParishes([]);
        return;
      }
      setParishes(Array.isArray(json.data) ? json.data : json.data?.data ?? []);
    } catch {
      if (requestedDeaneryRef.current !== deaneryUuid) return;
      setListError("Unable to reach the server.");
    } finally {
      if (requestedDeaneryRef.current === deaneryUuid) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDeanery) loadParishes(selectedDeanery);
  }, [selectedDeanery, loadParishes]);

  function startCreate() {
    setEditing(null);
    setParishName("");
    setParishSlug("");
    setAdminName("");
    setAdminEmail("");
    setFormDeaneryUuid(selectedDeanery);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(p: Parish) {
    setEditing(p);
    setParishName(p.parish_name);
    setParishSlug(p.slug);
    setFormDeaneryUuid(selectedDeanery); // best guess - list doesn't return the parish's own deanery_uuid, and it's the deanery currently being browsed
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
        ? { parish_name: parishName, slug: parishSlug, deanery_uuid: formDeaneryUuid }
        : {
            parish_name: parishName,
            slug: parishSlug,
            deanery_uuid: formDeaneryUuid,
            name: adminName,
            email: adminEmail,
          };

      const res = editing
        ? await fetch(`/api/parishes/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/parishes`, {
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
      loadParishes(selectedDeanery);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(p: Parish) {
    if (!window.confirm(`Delete "${p.parish_name}"? This can't be undone.`)) return;
    setDeletingUuid(p.uuid);
    try {
      const res = await fetch(`/api/parishes/${p.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete parish.");
        return;
      }
      if (editing?.uuid === p.uuid) startCreate();
      loadParishes(selectedDeanery);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Parishes</h1>
        <p>Every parish belongs to a deanery, and every deanery belongs to a region. Pick a region, then a deanery, to see and manage its parishes.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 480, display: "flex", gap: 16 }}>
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Region</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} disabled={regionsLoading}>
            <option value="" disabled>{regionsLoading ? "Loading regions\u2026" : "Select a region"}</option>
            {regions.map((r) => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
          </select>
          {regionsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{regionsError}</div>}
        </div>

        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label>Deanery</label>
          <select
            value={selectedDeanery}
            onChange={(e) => setSelectedDeanery(e.target.value)}
            disabled={deaneriesLoading || deaneryOptions.length === 0}
          >
            <option value="" disabled>
              {deaneriesLoading ? "Loading deaneries\u2026" : deaneryOptions.length === 0 ? "No deaneries in this region" : "Select a deanery"}
            </option>
            {deaneryOptions.map((d) => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
          </select>
          {deaneriesError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{deaneriesError}</div>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>Parishes in this deanery</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${parishes.length} parish${parishes.length === 1 ? "" : "es"}`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Parish</th><th>Slug</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {parishes.length ? parishes.map((p) => (
                <tr key={p.uuid}>
                  <td className="fw6">{p.parish_name}</td>
                  <td className="fw6">{p.slug}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === p.uuid} onClick={() => handleDelete(p)}>
                        {deletingUuid === p.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && (
                <tr><td colSpan={canManage ? 3 : 2} className="empty">{selectedDeanery ? "No parishes in this deanery yet." : "Select a region and deanery above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.parish_name}` : "Create parish"}</h2>
            <div className="sub">{editing ? "Update its details below" : "The parish admin will set their own password via an emailed link"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Parish name</label>
                <input value={parishName} onChange={(e) => setParishName(e.target.value)} placeholder="e.g. St. Peter's" required disabled={isSaving} />
                {fieldErrors.parish_name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.parish_name[0]}</div>}
              </div>

              <div className="field">
                <label>Slug</label>
                <input value={parishSlug} onChange={(e) => setParishSlug(e.target.value)} placeholder="e.g. st-peters" required disabled={isSaving} />
                {fieldErrors.slug && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.slug[0]}</div>}
              </div>

              {!editing && (
                <>
                  <div className="field">
                    <label>Admin full name</label>
                    <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="e.g. Fr. Thomas" required disabled={isSaving} />
                    {fieldErrors.admin_name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.admin_name[0]}</div>}
                  </div>
                  <div className="field">
                    <label>Admin email</label>
                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="name@parish.org" required disabled={isSaving} />
                    {fieldErrors.admin_email && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.admin_email[0]}</div>}
                  </div>
                </>
              )}

              <div className="field">
                <label>Deanery</label>
                <select value={formDeaneryUuid} onChange={(e) => setFormDeaneryUuid(e.target.value)} required disabled={isSaving || deaneriesLoading}>
                  <option value="" disabled>Select a deanery</option>
                  {deaneryOptions.map((d) => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
                </select>
                {fieldErrors.deanery_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.deanery_uuid[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || deaneryOptions.length === 0}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create parish & send invite"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create parish</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove parishes.</p>
          </div>
        )}
      </div>
    </>
  );
}