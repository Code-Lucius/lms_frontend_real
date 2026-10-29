import Link from "next/link";
import { notFound } from "next/navigation";
import { load, plural, withQuery } from "@/lib/directory";
import { ParishionersPanel, Tile } from "@/components/directory/DirectoryParts";
import type { DeaneryHierarchyData, DirectoryParishioner, Paginated } from "@/lib/types";

const BASE = "/deanery-admin/directory";

export async function DeaneryDirectory({
  path = [],
  page = 1,
  search = "",
}: {
  path?: string[];
  page?: number;
  search?: string;
}) {
  if (path.length > 1) notFound();
  const [parishUuid] = path;

  const header = (deaneryName?: string) => (
    <div className="page-head">
      <h1>Student directory</h1>
      <p>
        Browse parishioners{deaneryName ? ` in ${deaneryName}` : ""} by parish. Open a parish to see its members.
      </p>
    </div>
  );
  const errorBox = (message: string) => (
    <>
      {header()}
      <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{message}</div>
    </>
  );

  // Your own deanery plus its parishes with parishioner counts (2 small queries).
  const overview = await load<DeaneryHierarchyData>("/deanery-admin/hierarchy");
  if (!overview.ok) return errorBox(overview.message);
  if (!overview.data) return errorBox("Your deanery could not be loaded.");
  const deanery = overview.data;

  const parish = parishUuid ? deanery.parishes.find((p) => p.uuid === parishUuid) : undefined;
  if (parishUuid && !parish) notFound();

  const crumbs: { label: string; href: string }[] = [{ label: deanery.name, href: BASE }];
  if (parish) crumbs.push({ label: parish.parish_name, href: `${BASE}/${parish.uuid}` });

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

  // Level 2: the parishioner table.
  if (parish) {
    const parishHref = `${BASE}/${parish.uuid}`;
    const result = await load<Paginated<DirectoryParishioner>>(
      `/deanery-admin/directory/parishes/${parish.uuid}/parishioners${withQuery("", { page, search })}`
    );

    return (
      <>
        {header(deanery.name)}
        {breadcrumbs}
        <ParishionersPanel parishName={parish.parish_name} parishHref={parishHref} search={search} result={result} />
      </>
    );
  }

  // Level 1: parish tiles.
  return (
    <>
      {header(deanery.name)}
      {breadcrumbs}
      {deanery.parishes.length ? (
        <div className="dir-grid">
          {deanery.parishes.map((p) => (
            <Tile
              key={p.uuid}
              href={`${BASE}/${p.uuid}`}
              kind="Parish"
              label={p.parish_name}
              meta={plural(p.parishioners_count, "parishioner", "parishioners")}
            />
          ))}
        </div>
      ) : (
        <div className="empty">No parishes in this deanery yet.</div>
      )}
    </>
  );
}