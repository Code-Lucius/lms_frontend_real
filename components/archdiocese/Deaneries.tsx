"use client";

import { useCallback, useEffect, useState } from "react";
import { useRegionOptions } from "@/hooks/useRegionOptions";
import type { Deanery, Paginated } from "@/lib/types";

export function Deaneries({ canManage }: { canManage: boolean }) {
  const { regions, isLoading: regionsLoading, error: regionsError } = useRegionOptions();

  const [selectedRegion, setSelectedRegion] = useState("");
  const [deaneries, setDeaneries] = useState<Deanery[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Deanery | null>(null);
  const [name, setName] = useState("");
  const [formRegionUuid, setFormRegionUuid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  // Default the region filter to the first region once regions load.
  useEffect(() => {
    if (!selectedRegion && regions.length > 0) {
      setSelectedRegion(regions[0].uuid);
      setFormRegionUuid(regions[0].uuid);
    }
  }, [regions, selectedRegion]);

  const loadDeaneries = useCallback(async (region: string, p: number) => {
    if (!region) {
      setDeaneries([]);
      return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/deaneries?region=${region}&page=${p}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load deaneries.");
        setDeaneries([]);
        return;
      }
      const paginated: Paginated<Deanery> = json.data;
      setDeaneries(paginated?.data ?? []);
      setPage(paginated?.current_page ?? 1);
      setLastPage(paginated?.last_page ?? 1);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRegion) loadDeaneries(selectedRegion, 1);
  }, [selectedRegion, loadDeaneries]);

  function startCreate() {
    setEditing(null);
    setName("");
    setFormRegionUuid(selectedRegion);
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(d: Deanery) {
    setEditing(d);
    setName(d.name);
    setFormRegionUuid(selectedRegion); // best guess - list doesn't return the deanery's region_uuid directly, and it's the region currently being browsed
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const body = { name, region_uuid: formRegionUuid };
      const res = editing
        ? await fetch(`/api/deaneries/${editing.uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/deaneries`, {
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
      loadDeaneries(selectedRegion, page);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(d: Deanery) {
    if (!window.confirm(`Delete "${d.name}"? This can't be undone.`)) return;
    setDeletingUuid(d.uuid);
    try {
      const res = await fetch(`/api/deaneries/${d.uuid}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to delete deanery.");
        return;
      }
      if (editing?.uuid === d.uuid) startCreate();
      loadDeaneries(selectedRegion, page);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Deaneries</h1>
        <p>Every deanery belongs to a region. Pick a region below to see and manage its deaneries.</p>
      </div>

      <div className="card panel" style={{ marginBottom: 18, maxWidth: 360 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Region</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} disabled={regionsLoading}>
            <option value="" disabled>{regionsLoading ? "Loading regions\u2026" : "Select a region"}</option>
            {regions.map((r) => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
          </select>
          {regionsError && <div style={{ color: "#b91c1c", fontSize: 12 }}>{regionsError}</div>}
          {regions.length === 0 && !regionsLoading && !regionsError && (
            <div className="muted" style={{ fontSize: 12 }}>No regions yet &mdash; create one first under Region &rsaquo; Regions.</div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card panel">
          <h2 style={{ fontSize: 17 }}>Deaneries in this region</h2>
          <div className="sub">{isLoading ? "Loading\u2026" : `${deaneries.length} on this page`}</div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          <table className="tbl">
            <thead><tr><th>Deanery</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {deaneries.length ? deaneries.map((d) => (
                <tr key={d.uuid}>
                  <td className="fw6">{d.name}</td>
                  {canManage && (
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(d)}>Edit</button>{" "}
                      <button className="btn btn-ghost btn-sm" disabled={deletingUuid === d.uuid} onClick={() => handleDelete(d)}>
                        {deletingUuid === d.uuid ? "Removing\u2026" : "Remove"}
                      </button>
                    </td>
                  )}
                </tr>
              )) : !isLoading && <tr><td colSpan={canManage ? 2 : 1} className="empty">{selectedRegion ? "No deaneries in this region yet." : "Select a region above."}</td></tr>}
            </tbody>
          </table>

          {lastPage > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadDeaneries(selectedRegion, page - 1)}>Previous</button>
              <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadDeaneries(selectedRegion, page + 1)}>Next</button>
            </div>
          )}
        </div>

        {canManage ? (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>{editing ? `Edit ${editing.name}` : "Create deanery"}</h2>
            <div className="sub">{editing ? "Update its details below" : "Deanery names must be unique"}</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Deanery name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ikeja Deanery" required disabled={isSaving} />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label>Region</label>
                <select value={formRegionUuid} onChange={(e) => setFormRegionUuid(e.target.value)} required disabled={isSaving || regionsLoading}>
                  <option value="" disabled>Select a region</option>
                  {regions.map((r) => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
                </select>
                {fieldErrors.region_uuid && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.region_uuid[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || regions.length === 0}>
                  {isSaving ? "Saving\u2026" : editing ? "Save changes" : "Create deanery"}
                </button>
                {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>Cancel</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2 style={{ fontSize: 17 }}>Create deanery</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only super admins can create, edit, or remove deaneries.</p>
          </div>
        )}
      </div>
    </>
  );
}
