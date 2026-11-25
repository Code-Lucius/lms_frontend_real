import Link from "next/link";
import { notFound } from "next/navigation";
import { Person } from "@/components/ui";
import { load, plural, withQuery } from "@/lib/directory";
import { ExerciseCell, StatusBadge } from "@/components/results/ResultCells";
import { AnalyticsFilterBar } from "./AnalyticsFilterBar";
import { ModuleAveragesPanel, PassRatePanel, termCourseFields } from "./AnalyticsPanels";
import type { DeaneryAnalyticsPayload } from "@/lib/types";

const REGION_BASE = "/region-admin/analytics";

export async function DeaneryAnalytics({
  deaneryUuid,
  term,
  course,
  parish,
  page = 1,
}: {
  deaneryUuid: string;
  term?: string;
  course?: string;
  parish?: string;
  page?: number;
}) {
  const basePath = `${REGION_BASE}/${deaneryUuid}`;
  const res = await load<DeaneryAnalyticsPayload>(
    `/region-admin/analytics/deaneries/${deaneryUuid}${withQuery("", { term, course, parish, page })}`
  );

  if (!res.ok && res.status === 404) notFound();

  if (!res.ok) {
    return (
      <>
        <div className="page-head"><h1>Analytics</h1></div>
        <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{res.message}</div>
      </>
    );
  }

  const { region, deanery, filters, module_averages, pass_rate, parishes, results } = res.data;
  const sel = filters.selected;
  const keep = { term: sel.term ?? undefined, course: sel.course ?? undefined };

  const header = (
    <div className="page-head">
      <div className="eyebrow">{region.name} &rsaquo; {deanery.name}</div>
      <h1>Analytics</h1>
      <p>Performance across the parishes of {deanery.name}, and every result in the deanery.</p>
    </div>
  );

  const breadcrumbs = (
    <div className="dir-crumbs">
      <Link href={withQuery(REGION_BASE, keep)}>{region.name}</Link>
      <span>
        <span className="sep"> &rsaquo; </span>
        <Link href={withQuery(basePath, keep)}>{deanery.name}</Link>
      </span>
    </div>
  );

  if (!filters.terms.length) {
    return (
      <>
        {header}
        {breadcrumbs}
        <div className="empty">No term has been started yet.</div>
      </>
    );
  }

  const termName = filters.terms.find((t) => t.uuid === sel.term)?.name;
  const pageHref = (n: number) => `${withQuery(basePath, { ...keep, parish: sel.parish ?? undefined, page: n })}#results`;

  return (
    <>
      {header}
      {breadcrumbs}

      <div style={{ marginBottom: 18 }}>
        <AnalyticsFilterBar
          baseHref={basePath}
          fields={termCourseFields(filters)}
          values={{ term: sel.term, course: sel.course, parish: sel.parish }}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <ModuleAveragesPanel rows={module_averages} courseSelected={!!sel.course} />
        <PassRatePanel pass={pass_rate} termName={termName} />
      </div>

      <div className="card panel" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17 }}>By parish</h2>
        <div className="sub">Average score and pass rate per parish &middot; open one to filter the results below</div>
        <table className="tbl">
          <thead>
            <tr><th>Parish</th><th>Parishioners</th><th>Avg. score</th><th>Pass rate</th></tr>
          </thead>
          <tbody>
            {parishes.length ? parishes.map((p) => (
              <tr key={p.uuid}>
                <td className="fw6">
                  <Link
                    href={`${withQuery(basePath, { ...keep, parish: p.uuid })}#results`}
                    style={{ color: "var(--plum)", textDecoration: "none" }}
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="muted">{p.enrolled}</td>
                <td className="fw6">{p.average !== null ? `${p.average}%` : "—"}</td>
                <td>{p.pass_rate !== null ? `${p.pass_rate}%` : "—"}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="empty">No parishes in this deanery yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card panel" id="results">
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 17 }}>All results</h2>
            <div className="sub">{plural(results.total, "result", "results")}</div>
          </div>
          <div className="spacer" />
          <AnalyticsFilterBar
            baseHref={basePath}
            fields={[
              {
                key: "parish",
                label: "Parish",
                allLabel: "All parishes",
                options: (filters.parishes ?? []).map((p) => ({ value: p.uuid, label: p.name })),
              },
            ]}
            values={{ term: sel.term, course: sel.course, parish: sel.parish }}
          />
        </div>

        <table className="tbl">
          <thead>
            <tr><th>Parishioner</th><th>Parish</th><th>Module</th><th>Exercise</th><th>Exam</th><th>Status</th></tr>
          </thead>
          <tbody>
            {results.data.length ? results.data.map((r) => (
              <tr key={`${r.parishioner_code}-${r.module_uuid}`}>
                <td><Person name={r.parishioner_name} /></td>
                <td className="muted">{r.parish_name}</td>
                <td className="muted">
                  {r.module_name}
                  <div style={{ fontSize: 12 }}>{r.course_name}</div>
                </td>
                <td><ExerciseCell r={r} /></td>
                <td className="fw6">{r.exam_percentage !== null ? `${Math.round(r.exam_percentage)}%` : "—"}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="empty">No enrolled parishioners match these filters.</td></tr>
            )}
          </tbody>
        </table>

        {results.last_page > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            {results.current_page > 1
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(results.current_page - 1)}>Previous</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Previous</button>}
            <span className="muted" style={{ fontSize: 12.5 }}>Page {results.current_page} of {results.last_page}</span>
            {results.current_page < results.last_page
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(results.current_page + 1)}>Next</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Next</button>}
          </div>
        )}
      </div>
    </>
  );
}