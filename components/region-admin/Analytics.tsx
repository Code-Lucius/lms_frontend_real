import Link from "next/link";
import { load, plural, withQuery } from "@/lib/directory";
import { AnalyticsFilterBar } from "./AnalyticsFilterBar";
import { ModuleAveragesPanel, PassRatePanel, termCourseFields } from "./AnalyticsPanels";
import type { RegionAnalyticsPayload } from "@/lib/types";

const BASE = "/region-admin/analytics";

export async function Analytics({
  term,
  course,
  page = 1,
}: {
  term?: string;
  course?: string;
  page?: number;
}) {
  const res = await load<RegionAnalyticsPayload>(`/region-admin/analytics${withQuery("", { term, course, page })}`);

  const header = (regionName?: string) => (
    <div className="page-head">
      {regionName && <div className="eyebrow">{regionName}</div>}
      <h1>Analytics</h1>
      <p>Performance across the region, per module and per deanery. Open a deanery for its parishes and every result in it.</p>
    </div>
  );

  if (!res.ok) {
    return (
      <>
        {header()}
        <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{res.message}</div>
      </>
    );
  }

  const { region, filters, module_averages, pass_rate, deaneries } = res.data;
  const sel = filters.selected;

  if (!filters.terms.length) {
    return (
      <>
        {header(region.name)}
        <div className="empty">No term has been started yet.</div>
      </>
    );
  }

  const termName = filters.terms.find((t) => t.uuid === sel.term)?.name;
  const keep = { term: sel.term ?? undefined, course: sel.course ?? undefined };
  const pageHref = (n: number) => withQuery(BASE, { ...keep, page: n });

  return (
    <>
      {header(region.name)}

      <div style={{ marginBottom: 18 }}>
        <AnalyticsFilterBar baseHref={BASE} fields={termCourseFields(filters)} values={{ term: sel.term, course: sel.course }} />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <ModuleAveragesPanel rows={module_averages} courseSelected={!!sel.course} />
        <PassRatePanel pass={pass_rate} termName={termName} />
      </div>

      <div className="card panel">
        <h2 style={{ fontSize: 17 }}>By deanery</h2>
        <div className="sub">Average score and pass rate per deanery &middot; {plural(deaneries.total, "deanery", "deaneries")}</div>
        <table className="tbl">
          <thead>
            <tr><th>Deanery</th><th>Parishioners</th><th>Avg. score</th><th>Pass rate</th></tr>
          </thead>
          <tbody>
            {deaneries.data.length ? deaneries.data.map((d) => (
              <tr key={d.uuid}>
                <td className="fw6">
                  <Link href={withQuery(`${BASE}/${d.uuid}`, keep)} style={{ color: "var(--plum)", textDecoration: "none" }}>{d.name}</Link>
                </td>
                <td className="muted">{d.enrolled}</td>
                <td className="fw6">{d.average !== null ? `${d.average}%` : "—"}</td>
                <td>{d.pass_rate !== null ? `${d.pass_rate}%` : "—"}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="empty">No deaneries in this region yet.</td></tr>
            )}
          </tbody>
        </table>

        {deaneries.last_page > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            {deaneries.current_page > 1
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(deaneries.current_page - 1)}>Previous</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Previous</button>}
            <span className="muted" style={{ fontSize: 12.5 }}>Page {deaneries.current_page} of {deaneries.last_page}</span>
            {deaneries.current_page < deaneries.last_page
              ? <Link className="btn btn-ghost btn-sm" href={pageHref(deaneries.current_page + 1)}>Next</Link>
              : <button className="btn btn-ghost btn-sm" disabled>Next</button>}
          </div>
        )}
      </div>
    </>
  );
}