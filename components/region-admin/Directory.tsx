// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { Badge, Person } from "@/components/ui";
// import { IconSearch } from "@/components/icons";
// import { fetchWithAuth, NotAuthenticatedError } from "@/lib/api";
// import type { DirectoryParishioner, HierarchyParish, Paginated, RegionDirectoryOverview } from "@/lib/types";

// const BASE = "/region-admin/directory";

// type Loaded<T> = { ok: true; data: T } | { ok: false; message: string };

// async function load<T>(path: string): Promise<Loaded<T>> {
//   try {
//     const res = await fetchWithAuth(path);
//     const json = await res.json().catch(() => ({}));
//     if (!res.ok) return { ok: false, message: json.message ?? "Request failed." };
//     return { ok: true, data: json.data as T };
//   } catch (e) {
//     return { ok: false, message: e instanceof NotAuthenticatedError ? "Not authenticated." : "Unable to reach the server." };
//   }
// }

// function plural(n: number, one: string, many: string) {
//   return `${n} ${n === 1 ? one : many}`;
// }

// function withQuery(base: string, params: Record<string, string | number | undefined>) {
//   const qs = new URLSearchParams();
//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== undefined && v !== "") qs.set(k, String(v));
//   });
//   const s = qs.toString();
//   return s ? `${base}?${s}` : base;
// }

// function Tile({ href, kind, label, meta }: { href: string; kind: string; label: string; meta: string }) {
//   return (
//     <Link className="dir-tile" href={href} style={{ textDecoration: "none", color: "inherit" }}>
//       <span className="k">{kind}</span>
//       <span className="l">{label}</span>
//       <span className="m">{meta}</span>
//       {/* Subscription badge for parishes - not wired up yet */}
//     </Link>
//   );
// }

// export async function RegionDirectory({
//   path = [],
//   page = 1,
//   search = "",
// }: {
//   path?: string[];
//   page?: number;
//   search?: string;
// }) {
//   if (path.length > 2) notFound();
//   const [deaneryUuid, parishUuid] = path;

//   const header = (regionName?: string) => (
//     <div className="page-head">
//       <h1>Student directory</h1>
//       <p>
//         Browse parishioners{regionName ? ` in ${regionName}` : ""}: Deanery &rarr; Parish. Drill down to a parish to see its members.
//       </p>
//     </div>
//   );
//   const errorBox = (message: string) => (
//     <>
//       {header()}
//       <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{message}</div>
//     </>
//   );

//   // The admin's own region + its deaneries (3 small queries).
//   const overview = await load<RegionDirectoryOverview>("/region-admin/directory");
//   if (!overview.ok) return errorBox(overview.message);
//   const region = overview.data;

//   const deanery = deaneryUuid ? region.deaneries.find((d) => d.uuid === deaneryUuid) : undefined;
//   if (deaneryUuid && !deanery) notFound();

//   let parishes: HierarchyParish[] = [];
//   if (deanery) {
//     const res = await load<HierarchyParish[]>(`/region-admin/directory/deaneries/${deanery.uuid}/parishes`);
//     if (!res.ok) return errorBox(res.message);
//     parishes = res.data;
//   }
//   const parish = parishUuid ? parishes.find((p) => p.uuid === parishUuid) : undefined;
//   if (parishUuid && !parish) notFound();

//   const crumbs: { label: string; href: string }[] = [{ label: region.name, href: BASE }];
//   if (deanery) crumbs.push({ label: deanery.name, href: `${BASE}/${deanery.uuid}` });
//   if (deanery && parish) crumbs.push({ label: parish.parish_name, href: `${BASE}/${deanery.uuid}/${parish.uuid}` });

//   const breadcrumbs = (
//     <div className="dir-crumbs">
//       {crumbs.map((c, i) => (
//         <span key={c.href}>
//           {i > 0 && <span className="sep"> &rsaquo; </span>}
//           <Link href={c.href}>{c.label}</Link>
//         </span>
//       ))}
//     </div>
//   );

//   // Level 3: parishioner table with search + pagination.
//   if (deanery && parish) {
//     const parishHref = `${BASE}/${deanery.uuid}/${parish.uuid}`;
//     const apiPath = `/region-admin/directory/parishes/${parish.uuid}/parishioners${withQuery("", { page, search })}`;
//     const res = await load<Paginated<DirectoryParishioner>>(apiPath);

//     return (
//       <>
//         {header(region.name)}
//         {breadcrumbs}
//         <div className="card panel">
//           <h2 style={{ fontSize: 17 }}>Parishioners</h2>
//           <div className="sub">
//             {parish.parish_name}
//             {res.ok ? ` · ${plural(res.data.total, search ? "match" : "parishioner", search ? "matches" : "parishioners")}` : ""}
//           </div>

//           <form action={parishHref} method="get" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "8px 0 16px" }}>
//             <div className="search">
//               <IconSearch width={15} height={15} />
//               <input
//                 name="search"
//                 defaultValue={search}
//                 placeholder="Search by name or parishioner code"
//                 aria-label="Search parishioners"
//                 maxLength={100}
//               />
//             </div>
//             <button type="submit" className="btn btn-primary btn-sm">Search</button>
//             {search && <Link className="btn btn-ghost btn-sm" href={parishHref}>Clear</Link>}
//           </form>

//           {!res.ok && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{res.message}</div>}

//           {res.ok && (
//             <>
//               <table className="tbl">
//                 <thead>
//                   <tr><th>Parishioner</th><th>Parishioner code</th><th>Enrolment</th><th>Status</th></tr>
//                 </thead>
//                 <tbody>
//                   {res.data.data.length ? res.data.data.map((p) => (
//                     <tr key={p.parish_code}>
//                       <td><Person name={p.name} email={p.email} /></td>
//                       <td className="muted">{p.parish_code}</td>
//                       <td className="muted">{p.courses_count ? plural(p.courses_count, "course", "courses") : "—"}</td>
//                       <td><Badge state={p.status} /></td>
//                     </tr>
//                   )) : (
//                     <tr>
//                       <td colSpan={4} className="empty">
//                         {search ? `No parishioners match “${search}”.` : "No parishioners in this parish yet."}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>

//               {res.data.last_page > 1 && (
//                 <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
//                   {res.data.current_page > 1
//                     ? <Link className="btn btn-ghost btn-sm" href={withQuery(parishHref, { page: res.data.current_page - 1, search })}>Previous</Link>
//                     : <button className="btn btn-ghost btn-sm" disabled>Previous</button>}
//                   <span className="muted" style={{ fontSize: 12.5 }}>Page {res.data.current_page} of {res.data.last_page}</span>
//                   {res.data.current_page < res.data.last_page
//                     ? <Link className="btn btn-ghost btn-sm" href={withQuery(parishHref, { page: res.data.current_page + 1, search })}>Next</Link>
//                     : <button className="btn btn-ghost btn-sm" disabled>Next</button>}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </>
//     );
//   }

//   // Levels 1-2: tiles.
//   const tiles = deanery
//     ? parishes.map((p) => ({
//         href: `${BASE}/${deanery.uuid}/${p.uuid}`,
//         kind: "Parish",
//         label: p.parish_name,
//         meta: plural(p.parishioners_count, "parishioner", "parishioners"),
//       }))
//     : region.deaneries.map((d) => ({
//         href: `${BASE}/${d.uuid}`,
//         kind: "Deanery",
//         label: d.name,
//         meta: plural(d.parish_count, "parish", "parishes"),
//       }));
//   const emptyText = deanery ? "No parishes in this deanery yet." : "No deaneries in this region yet.";

//   return (
//     <>
//       {header(region.name)}
//       {breadcrumbs}
//       {tiles.length ? (
//         <div className="dir-grid">
//           {tiles.map((t) => <Tile key={t.href} {...t} />)}
//         </div>
//       ) : (
//         <div className="empty">{emptyText}</div>
//       )}
//     </>
//   );
// }

import Link from "next/link";
import { notFound } from "next/navigation";
import { load, plural, withQuery } from "@/lib/directory";
import { ParishionersPanel, Tile } from "@/components/directory/DirectoryParts";
import type { DirectoryParishioner, HierarchyParish, Paginated, RegionDirectoryOverview } from "@/lib/types";

const BASE = "/region-admin/directory";

export async function RegionDirectory({
  path = [],
  page = 1,
  search = "",
}: {
  path?: string[];
  page?: number;
  search?: string;
}) {
  if (path.length > 2) notFound();
  const [deaneryUuid, parishUuid] = path;

  const header = (regionName?: string) => (
    <div className="page-head">
      <h1>Student directory</h1>
      <p>
        Browse parishioners{regionName ? ` in ${regionName}` : ""}: Deanery &rarr; Parish. Drill down to a parish to see its members.
      </p>
    </div>
  );
  const errorBox = (message: string) => (
    <>
      {header()}
      <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{message}</div>
    </>
  );

  // The admin's own region + its deaneries (3 small queries).
  const overview = await load<RegionDirectoryOverview>("/region-admin/directory");
  if (!overview.ok) return errorBox(overview.message);
  const region = overview.data;

  const deanery = deaneryUuid ? region.deaneries.find((d) => d.uuid === deaneryUuid) : undefined;
  if (deaneryUuid && !deanery) notFound();

  let parishes: HierarchyParish[] = [];
  if (deanery) {
    const res = await load<HierarchyParish[]>(`/region-admin/directory/deaneries/${deanery.uuid}/parishes`);
    if (!res.ok) return errorBox(res.message);
    parishes = res.data;
  }
  const parish = parishUuid ? parishes.find((p) => p.uuid === parishUuid) : undefined;
  if (parishUuid && !parish) notFound();

  const crumbs: { label: string; href: string }[] = [{ label: region.name, href: BASE }];
  if (deanery) crumbs.push({ label: deanery.name, href: `${BASE}/${deanery.uuid}` });
  if (deanery && parish) crumbs.push({ label: parish.parish_name, href: `${BASE}/${deanery.uuid}/${parish.uuid}` });

  const breadcrumbs = (
    <div className="dir-crumbs">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          {i > 0 && <span className="sep"> &rsaquo; </span>}
          <Link href={c.href}>{c.label}</Link>
        </span>
      ))}
    </div>
  );

  // Level 3: parishioner table with search + pagination.
  if (deanery && parish) {
    const parishHref = `${BASE}/${deanery.uuid}/${parish.uuid}`;
    const result = await load<Paginated<DirectoryParishioner>>(
      `/region-admin/directory/parishes/${parish.uuid}/parishioners${withQuery("", { page, search })}`
    );

    return (
      <>
        {header(region.name)}
        {breadcrumbs}
        <ParishionersPanel parishName={parish.parish_name} parishHref={parishHref} search={search} result={result} />
      </>
    );
  }

  // Levels 1-2: tiles.
  const tiles = deanery
    ? parishes.map((p) => ({
        href: `${BASE}/${deanery.uuid}/${p.uuid}`,
        kind: "Parish",
        label: p.parish_name,
        meta: plural(p.parishioners_count, "parishioner", "parishioners"),
      }))
    : region.deaneries.map((d) => ({
        href: `${BASE}/${d.uuid}`,
        kind: "Deanery",
        label: d.name,
        meta: plural(d.parish_count, "parish", "parishes"),
      }));
  const emptyText = deanery ? "No parishes in this deanery yet." : "No deaneries in this region yet.";

  return (
    <>
      {header(region.name)}
      {breadcrumbs}
      {tiles.length ? (
        <div className="dir-grid">
          {tiles.map((t) => <Tile key={t.href} {...t} />)}
        </div>
      ) : (
        <div className="empty">{emptyText}</div>
      )}
    </>
  );
}