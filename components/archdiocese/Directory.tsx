import Link from "next/link";
import { notFound } from "next/navigation";
import { load, plural, withQuery } from "@/lib/directory";
import { ParishionersPanel, Tile } from "@/components/directory/DirectoryParts";
import type { DirectoryParishioner, HierarchyParish, HierarchyRegion, Paginated } from "@/lib/types";

const BASE = "/archdiocese/directory";

export async function Directory({
  path = [],
  page = 1,
  search = "",
}: {
  path?: string[];
  page?: number;
  search?: string;
}) {
  if (path.length > 3) notFound();
  const [regionUuid, deaneryUuid, parishUuid] = path;

  const header = (
    <div className="page-head">
      <h1>Student directory</h1>
      <p>Browse parishioners grouped by Region &rarr; Deanery &rarr; Parish. Drill down to a parish to see its members.</p>
    </div>
  );
  const errorBox = (message: string) => (
    <>
      {header}
      <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{message}</div>
    </>
  );

  // Regions + deaneries (+ parish counts per deanery): 3 cheap queries.
  const tree = await load<HierarchyRegion[]>("/archdiocese-admin/hierarchy");
  if (!tree.ok) return errorBox(tree.message);

  const region = regionUuid ? tree.data.find((r) => r.uuid === regionUuid) : undefined;
  if (regionUuid && !region) notFound();
  const deanery = deaneryUuid ? region?.deaneries.find((d) => d.uuid === deaneryUuid) : undefined;
  if (deaneryUuid && !deanery) notFound();

  // Parishes are only fetched once we're inside a deanery.
  let parishes: HierarchyParish[] = [];
  if (deanery) {
    const res = await load<HierarchyParish[]>(`/archdiocese-admin/hierarchy/deaneries/${deanery.uuid}/parishes`);
    if (!res.ok) return errorBox(res.message);
    parishes = res.data;
  }
  const parish = parishUuid ? parishes.find((p) => p.uuid === parishUuid) : undefined;
  if (parishUuid && !parish) notFound();

  const crumbs: { label: string; href: string }[] = [{ label: "Archdiocese", href: BASE }];
  if (region) crumbs.push({ label: region.name, href: `${BASE}/${region.uuid}` });
  if (region && deanery) crumbs.push({ label: deanery.name, href: `${BASE}/${region.uuid}/${deanery.uuid}` });
  if (region && deanery && parish) crumbs.push({ label: parish.parish_name, href: `${BASE}/${region.uuid}/${deanery.uuid}/${parish.uuid}` });

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

  // Level 4: the parishioner table, with search + pagination.
  if (region && deanery && parish) {
    const parishHref = `${BASE}/${region.uuid}/${deanery.uuid}/${parish.uuid}`;
    const result = await load<Paginated<DirectoryParishioner>>(
      `/archdiocese-admin/parishes/${parish.uuid}/parishioners${withQuery("", { page, search })}`
    );

    return (
      <>
        {header}
        {breadcrumbs}
        <ParishionersPanel parishName={parish.parish_name} parishHref={parishHref} search={search} result={result} />
      </>
    );
  }

  // Levels 1-3: tiles.
  let tiles: { href: string; kind: string; label: string; meta: string }[];
  let emptyText: string;

  if (region && deanery) {
    tiles = parishes.map((p) => ({
      href: `${BASE}/${region.uuid}/${deanery.uuid}/${p.uuid}`,
      kind: "Parish",
      label: p.parish_name,
      meta: plural(p.parishioners_count, "parishioner", "parishioners"),
    }));
    emptyText = "No parishes in this deanery yet.";
  } else if (region) {
    tiles = region.deaneries.map((d) => ({
      href: `${BASE}/${region.uuid}/${d.uuid}`,
      kind: "Deanery",
      label: d.name,
      meta: plural(d.parish_count, "parish", "parishes"),
    }));
    emptyText = "No deaneries in this region yet.";
  } else {
    tiles = tree.data.map((r) => ({
      href: `${BASE}/${r.uuid}`,
      kind: "Region",
      label: r.name,
      meta: plural(r.deaneries.length, "deanery", "deaneries"),
    }));
    emptyText = "No regions yet.";
  }

  return (
    <>
      {header}
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