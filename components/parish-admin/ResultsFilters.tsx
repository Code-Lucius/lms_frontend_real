"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ParishResultsFilters } from "@/lib/types";

const selectStyle = { margin: 0, width: "auto", padding: "9px 12px" } as const;

export function ResultsFilters({ baseHref, filters }: { baseHref: string; filters: ParishResultsFilters }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { terms, courses, modules, selected } = filters;

  function change(field: "term" | "course" | "module", value: string) {
    const next = { term: selected.term, course: selected.course, module: selected.module };
    next[field] = value || null;
    // Course options depend on the term, and modules on the course.
    if (field === "term") {
      next.course = null;
      next.module = null;
    }
    if (field === "course") next.module = null;

    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const query = qs.toString();
    startTransition(() => router.push(query ? `${baseHref}?${query}` : baseHref));
  }

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", opacity: isPending ? 0.6 : 1 }}>
      <select className="field" style={selectStyle} aria-label="Term" value={selected.term ?? ""} onChange={(e) => change("term", e.target.value)}>
        {terms.map((t) => (
          <option key={t.uuid} value={t.uuid}>{t.name}{t.status === "active" ? " (active)" : ""}</option>
        ))}
      </select>
      <select className="field" style={selectStyle} aria-label="Course" value={selected.course ?? ""} onChange={(e) => change("course", e.target.value)}>
        <option value="">All courses</option>
        {courses.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
      </select>
      <select className="field" style={selectStyle} aria-label="Module" value={selected.module ?? ""} disabled={!selected.course} onChange={(e) => change("module", e.target.value)}>
        <option value="">{selected.course ? "All modules" : "Select a course first"}</option>
        {modules.map((m) => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
      </select>
    </div>
  );
}