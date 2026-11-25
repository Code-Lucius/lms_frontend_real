import { Bars, Donut, DonutLegend, type Segment } from "@/components/ui";
import { plural } from "@/lib/directory";
import type { FilterField } from "./AnalyticsFilterBar";
import type { AnalyticsFilters, ModuleAverage, PassRate } from "@/lib/types";

export function termCourseFields(filters: AnalyticsFilters): FilterField[] {
  return [
    {
      key: "term",
      label: "Term",
      options: filters.terms.map((t) => ({ value: t.uuid, label: `${t.name}${t.status === "active" ? " (active)" : ""}` })),
    },
    {
      key: "course",
      label: "Course",
      allLabel: "All courses",
      options: filters.courses.map((c) => ({ value: c.uuid, label: c.name })),
    },
  ];
}

export function ModuleAveragesPanel({ rows, courseSelected }: { rows: ModuleAverage[]; courseSelected: boolean }) {
  return (
    <div className="card panel">
      <h2 style={{ fontSize: 17 }}>Average score by module</h2>
      <div className="sub">{courseSelected && rows[0] ? rows[0].course_name : "All courses"} &middot; results with an exam score</div>
      {rows.length ? (
        <Bars
          rows={rows.map((r) => [courseSelected ? r.module_name : `${r.course_name} · ${r.module_name}`, r.average] as [string, number])}
        />
      ) : (
        <div className="empty">No scored results yet for this selection.</div>
      )}
    </div>
  );
}

export function PassRatePanel({ pass, termName }: { pass: PassRate; termName?: string }) {
  const seg: Segment[] = [
    { label: "Passed", value: pass.passed_pct, color: "var(--sage)" },
    { label: "Not yet passed", value: pass.not_passed_pct, color: "var(--wine)" },
  ];
  return (
    <div className="card panel">
      <h2 style={{ fontSize: 17 }}>Pass rate</h2>
      <div className="sub">
        {plural(pass.total, "scored result", "scored results")} &middot; all courses{termName ? ` · ${termName}` : ""}
      </div>
      {pass.total ? (
        <div className="donut-row" style={{ marginTop: 8 }}>
          <Donut segments={seg} />
          <DonutLegend segments={seg} />
        </div>
      ) : (
        <div className="empty">No scored results yet for this term.</div>
      )}
    </div>
  );
}