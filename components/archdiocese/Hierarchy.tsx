import { fetchWithAuth } from "@/lib/api";
import { HierarchyTree } from "./HierarchyTree";
import type { HierarchyRegion } from "@/lib/types";

async function loadTree(): Promise<{ regions: HierarchyRegion[]; error: string | null }> {
  try {
    const res = await fetchWithAuth("/archdiocese-admin/hierarchy");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { regions: [], error: json.message ?? "Failed to load the hierarchy." };
    return { regions: json.data ?? [], error: null };
  } catch {
    return { regions: [], error: "Unable to reach the server." };
  }
}

export async function Hierarchy() {
  const { regions, error } = await loadTree();

  return (
    <>
      <div className="page-head">
        <h1>Hierarchy</h1>
        {/* Subscription state is not shown yet - re-add "each with its live subscription state" once subscriptions are wired up. */}
        <p>Browse the archdiocese top-down: Region &rarr; Deanery &rarr; Parish.</p>
      </div>
      <div className="card panel">
        {error && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{error}</div>}
        {!error && !regions.length && <div className="empty">No regions yet.</div>}
        {!error && regions.length > 0 && <HierarchyTree regions={regions} />}
      </div>
    </>
  );
}