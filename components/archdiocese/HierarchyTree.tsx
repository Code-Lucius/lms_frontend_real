"use client";

import { useState } from "react";
// import { Badge } from "@/components/ui"; // subscription badge - re-enable once subscriptions are wired up
import { IconChevron } from "@/components/icons";
import type { HierarchyRegion, HierarchyDeanery, HierarchyParish } from "@/lib/types";

const DEFAULT_PARISHES_BASE_PATH = "/api/hierarchy/deaneries";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function ParishRow({ parish }: { parish: HierarchyParish }) {
  return (
    <div className="tree-node">
      <div className="tree-row" style={{ cursor: "default" }}>
        <span style={{ width: 16 }} />
        <span className="kind">Parish</span><span className="label">{parish.parish_name}</span>
        <span className="spacer" />
        <span className="slug-tag">/{parish.slug}</span>{" "}
        {/* <Badge state={...} /> - subscription state, not wired up yet */}
        <span className="count">{plural(parish.parishioners_count, "parishioner", "parishioners")}</span>
      </div>
    </div>
  );
}

function RegionNode({ region, parishesBasePath }: { region: HierarchyRegion; parishesBasePath: string }) {
  const [open, setOpen] = useState(true);
  const hasKids = region.deaneries.length > 0;

  return (
    <div className="tree-node">
      <div className={`tree-row${open ? " open" : ""}`} onClick={hasKids ? () => setOpen((o) => !o) : undefined} style={hasKids ? undefined : { cursor: "default" }}>
        {hasKids ? <IconChevron className="chev" width={16} height={16} /> : <span style={{ width: 16 }} />}
        <span className="kind">Region</span><span className="label">{region.name}</span>
        <span className="spacer" />
        <span className="count">{plural(region.deaneries.length, "deanery", "deaneries")}</span>
      </div>
      {hasKids && open && (
        <div className="tree-children">
          {region.deaneries.map((d) => <DeaneryNode key={d.uuid} deanery={d} parishesBasePath={parishesBasePath} />)}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree({
  regions,
  parishesBasePath = DEFAULT_PARISHES_BASE_PATH,
}: {
  regions: HierarchyRegion[];
  parishesBasePath?: string;
}) {
  return <>{regions.map((r) => <RegionNode key={r.uuid} region={r} parishesBasePath={parishesBasePath} />)}</>;
}

export function DeaneryNode({
  deanery,
  parishesBasePath,
  initialParishes,
  defaultOpen = false,
}: {
  deanery: HierarchyDeanery;
  parishesBasePath?: string;           // optional now
  initialParishes?: HierarchyParish[]; // pass these to skip lazy loading
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [parishes, setParishes] = useState<HierarchyParish[] | null>(initialParishes ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasKids = deanery.parish_count > 0;

  async function loadParishes() {
    if (!parishesBasePath) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${parishesBasePath}/${deanery.uuid}/parishes`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to load parishes.");
        return;
      }
      setParishes(json.data ?? []);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggle() {
    if (!hasKids) return;
    const next = !open;
    setOpen(next);
    // Fetch only the first time this deanery is expanded (skipped when
    // initialParishes were passed in, since parishes is already set).
    if (next && parishes === null && !isLoading) loadParishes();
  }

  return (
    <div className="tree-node">
      <div className={`tree-row${open ? " open" : ""}`} onClick={hasKids ? toggle : undefined} style={hasKids ? undefined : { cursor: "default" }}>
        {hasKids ? <IconChevron className="chev" width={16} height={16} /> : <span style={{ width: 16 }} />}
        <span className="kind">Deanery</span><span className="label">{deanery.name}</span>
        <span className="spacer" />
        <span className="count">{plural(deanery.parish_count, "parish", "parishes")}</span>
      </div>
      {open && (
        <div className="tree-children">
          {isLoading && <div className="muted" style={{ fontSize: 12.5, padding: "8px 0 8px 28px" }}>Loading…</div>}
          {error && (
            <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, padding: "8px 0 8px 28px" }}>
              {error}{" "}
              <button className="btn btn-ghost btn-sm" onClick={loadParishes}>Retry</button>
            </div>
          )}
          {parishes?.map((p) => <ParishRow key={p.uuid} parish={p} />)}
        </div>
      )}
    </div>
  );

  
}