import Link from "next/link";
import { Badge, Person } from "@/components/ui";
import { load, plural, withQuery } from "@/lib/directory";
import { ResultsFilters } from "./ResultsFilters";
import type { ParishResultRow, ParishResultsPayload } from "@/lib/types";

function ExerciseCell({ r }: { r: ParishResultRow }) {
  if (r.exercise_percentage !== null) {
    return (
      <>
        <span className="fw6">{r.exercise_percentage}%</span>
        <div className="muted" style={{ fontSize: 12 }}>
          {r.exercise_earned}/{r.exercise_possible} marks{r.exercise_pending ? ` · ${r.exercise_pending} pending` : ""}
        </div>
      </>
    );
  }
  if (r.exercise_pending > 0) return <span className="fw6">Pending</span>;
  return <>—</>;
}

function StatusBadge({ status }: { status: ParishResultRow["status"] }) {
  if (status === "passed") return <Badge state="active" label="Passed" />;
  if (status === "failed") return <Badge state="closed" label="Not yet passed" />;
  return <Badge state="pending" label="In progress" />;
}

export async function Results({
  parishSlug,
  term,
  course,
  moduleUuid,
  page = 1,
}: {
  parishSlug: string;
  term?: string;
  course?: string;
  moduleUuid?: string;
  page?: number;
}) {
  const basePath = `/${parishSlug}/admin/results`;
  const res = await load<ParishResultsPayload>(
    `/${parishSlug}/parish-admin/results${withQuery("", { term, course, module: moduleUuid, page })}`
  );

  const header = (
    <div className="page-head">
      <h1>Results</h1>
      <p>Performance for parishioners in your parish. Grading is done by the region admin; you have read access here.</p>
    </div>
  );

  if (!res.ok) {
    return (
      <>
        {header}
        <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{res.message}</div>
      </>
    );
  }

  const { filters } = res.data;
  const sel = filters.selected;
  const pageHref = (n: number) =>
    withQuery(basePath, {
      term: sel.term ?? undefined,
      course: sel.course ?? undefined,
      module: sel.module ?? undefined,
      page: n,
    });

  if (!filters.terms.length) {
    return (
      <>
        {header}
        <div className="empty">No term has been started yet.</div>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="card panel">
        <ResultsFilters baseHref={basePath} filters={filters} />
        <div className="sub">{plural(res.data.total, "result", "results")}</div>

        <table className="tbl">
          <thead>
            <tr><th>Parishioner</th><th>Module</th><th>Exercise</th><th>Exam</th><th>Status</th></tr>
          </thead>
          <tbody>
            {res.data.data.length ? res.data.data.map((r) => (
              <tr key={`${r.parishioner_code}-${r.module_uuid}`}>
                <td><Person name={r.parishioner_name} /></td>
                <td className="muted">
                  {r.module_name}
                  <div style={{ fontSize: 12 }}>{r.course_name}</div>
                </td>
                <td><ExerciseCell r={r} /></td>
                <td className="fw6">{r.exam_percentage !== null ? `${Math.round(r.exam_percentage)}%` : "—"}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="empty">No enrolled parishioners match these filters.</td></tr>
            )}
          </tbody>
        </table>

        {res.data.last_page > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            {res.data.current_page > 1
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(res.data.current_page - 1)}>Previous</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Previous</button>}
            <span className="muted" style={{ fontSize: 12.5 }}>Page {res.data.current_page} of {res.data.last_page}</span>
            {res.data.current_page < res.data.last_page
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(res.data.current_page + 1)}>Next</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Next</button>}
          </div>
        )}
      </div>
    </>
  );
}