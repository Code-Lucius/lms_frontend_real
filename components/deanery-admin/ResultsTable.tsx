"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface ResultsFilters {
  terms: { uuid: string; name: string; status: string }[];
  current_term_uuid: string | null;
  parishes: { uuid: string; parish_name: string }[];
  courses: { uuid: string; name: string; modules: { uuid: string; name: string }[] }[];
}

interface ResultRow {
  parish_uuid: string;
  parish_name: string;
  module_uuid: string;
  module_name: string;
  course_name: string;
  exam_only: boolean;
  parishioners_count: number;
  avg_score: number;
  pass_rate: number;
}

interface PageData {
  data: ResultRow[];
  current_page: number;
  last_page: number;
}

const selectStyle = { margin: 0, width: "auto", padding: "9px 12px" } as const;

export function ResultsTable({ filters }: { filters: ResultsFilters }) {
  const [term, setTerm] = useState(filters.current_term_uuid ?? filters.terms[0]?.uuid ?? "");
  const [parish, setParish] = useState("");
  const [course, setCourse] = useState("");
  const [moduleUuid, setModuleUuid] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<ResultRow[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0); // drops stale responses when filters change quickly

  const moduleOptions = useMemo(() => {
    const source = course ? filters.courses.filter((c) => c.uuid === course) : filters.courses;
    return source.flatMap((c) =>
      c.modules.map((m) => ({ uuid: m.uuid, label: course ? m.name : `${c.name} \u00b7 ${m.name}` }))
    );
  }, [filters.courses, course]);

  const load = useCallback(async () => {
    if (!term) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ term, page: String(page) });
      if (parish) params.set("parish", parish);
      if (course) params.set("course", course);
      if (moduleUuid) params.set("module", moduleUuid);

      const res = await fetch(`/api/deanery-admin/results?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (requestIdRef.current !== requestId) return;

      if (!res.ok) {
        setError(json.message ?? "Failed to load results.");
        setRows([]);
        return;
      }
      const paginated: PageData = json.data;
      setRows(paginated?.data ?? []);
      setLastPage(paginated?.last_page ?? 1);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setError("Unable to reach the server.");
    } finally {
      if (requestIdRef.current === requestId) setIsLoading(false);
    }
  }, [term, parish, course, moduleUuid, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (!filters.terms.length) {
    return <div className="empty">No academic term has been started yet.</div>;
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <select className="field" style={selectStyle} value={term} onChange={(e) => { setTerm(e.target.value); setPage(1); }} aria-label="Term">
          {filters.terms.map((t) => (
            <option key={t.uuid} value={t.uuid}>{t.name}{t.status === "active" ? " (current)" : ""}</option>
          ))}
        </select>

        <select className="field" style={selectStyle} value={parish} onChange={(e) => { setParish(e.target.value); setPage(1); }} aria-label="Parish">
          <option value="">All parishes</option>
          {filters.parishes.map((p) => <option key={p.uuid} value={p.uuid}>{p.parish_name}</option>)}
        </select>

        <select
          className="field"
          style={selectStyle}
          value={course}
          onChange={(e) => { setCourse(e.target.value); setModuleUuid(""); setPage(1); }}
          aria-label="Course"
        >
          <option value="">All courses</option>
          {filters.courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
        </select>

        <select className="field" style={selectStyle} value={moduleUuid} onChange={(e) => { setModuleUuid(e.target.value); setPage(1); }} aria-label="Module">
          <option value="">All modules</option>
          {moduleOptions.map((m) => <option key={m.uuid} value={m.uuid}>{m.label}</option>)}
        </select>
      </div>

      {error && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <table className="tbl">
        <thead>
          <tr><th>Parish</th><th>Module</th><th>Parishioners</th><th>Avg. score</th><th>Pass rate</th></tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5} className="empty">Loading&hellip;</td></tr>
          ) : rows.length ? (
            rows.map((r) => (
              <tr key={`${r.parish_uuid}-${r.module_uuid}-${r.exam_only ? 1 : 0}`}>
                <td className="fw6">{r.parish_name}</td>
                <td className="muted">{r.course_name} {"\u00b7"} {r.module_name}</td>
                <td className="muted">{r.parishioners_count}</td>
                <td className="fw6">
                  {r.avg_score}%
                  {r.exam_only && <span className="slug-tag" style={{ marginLeft: 8 }}>exam scores only</span>}
                </td>
                <td>{r.pass_rate}%</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} className="empty">No results for these filters.</td></tr>
          )}
        </tbody>
      </table>

      {lastPage > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </>
  );
}