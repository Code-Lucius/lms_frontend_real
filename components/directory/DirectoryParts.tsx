import Link from "next/link";
import { Badge, Person } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import { plural, withQuery, type Loaded } from "@/lib/directory";
import type { DirectoryParishioner, Paginated } from "@/lib/types";

export function Tile({ href, kind, label, meta }: { href: string; kind: string; label: string; meta: string }) {
  return (
    <Link className="dir-tile" href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <span className="k">{kind}</span>
      <span className="l">{label}</span>
      <span className="m">{meta}</span>
      {/* Subscription badge for parishes - not wired up yet */}
    </Link>
  );
}

export function ParishionersPanel({
  parishName,
  parishHref,
  search,
  result,
}: {
  parishName: string;
  parishHref: string;
  search: string;
  result: Loaded<Paginated<DirectoryParishioner>>;
}) {
  return (
    <div className="card panel">
      <h2 style={{ fontSize: 17 }}>Parishioners</h2>
      <div className="sub">
        {parishName}
        {result.ok ? ` · ${plural(result.data.total, search ? "match" : "parishioner", search ? "matches" : "parishioners")}` : ""}
      </div>

      <form action={parishHref} method="get" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "8px 0 16px" }}>
        <div className="search">
          <IconSearch width={15} height={15} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or parishioner code"
            aria-label="Search parishioners"
            maxLength={100}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
        {search && <Link className="btn btn-ghost btn-sm" href={parishHref}>Clear</Link>}
      </form>

      {!result.ok && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{result.message}</div>}

      {result.ok && (
        <>
          <table className="tbl">
            <thead>
              <tr><th>Parishioner</th><th>Parishioner code</th><th>Enrolment</th><th>Status</th></tr>
            </thead>
            <tbody>
              {result.data.data.length ? result.data.data.map((p) => (
                <tr key={p.parish_code}>
                  <td><Person name={p.name} email={p.email} /></td>
                  <td className="muted">{p.parish_code}</td>
                  <td className="muted">{p.courses_count ? plural(p.courses_count, "course", "courses") : "—"}</td>
                  <td><Badge state={p.status} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="empty">
                    {search ? `No parishioners match “${search}”.` : "No parishioners in this parish yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {result.data.last_page > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
              {result.data.current_page > 1
                ? <Link className="btn btn-ghost btn-sm" href={withQuery(parishHref, { page: result.data.current_page - 1, search })}>Previous</Link>
                : <button className="btn btn-ghost btn-sm" disabled>Previous</button>}
              <span className="muted" style={{ fontSize: 12.5 }}>Page {result.data.current_page} of {result.data.last_page}</span>
              {result.data.current_page < result.data.last_page
                ? <Link className="btn btn-ghost btn-sm" href={withQuery(parishHref, { page: result.data.current_page + 1, search })}>Next</Link>
                : <button className="btn btn-ghost btn-sm" disabled>Next</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}