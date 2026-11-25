import { fetchWithAuth } from "@/lib/api";
import { ResultsTable } from "./ResultsTable";
import type { ResultsFilters } from "./ResultsTable";

async function loadFilters(): Promise<{ filters: ResultsFilters | null; error: string | null }> {
  try {
    const res = await fetchWithAuth("/deanery-admin/results/filters");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { filters: null, error: json.message ?? "Failed to load the results filters." };
    return { filters: json.data ?? null, error: null };
  } catch {
    return { filters: null, error: "Unable to reach the server." };
  }
}

export async function Results() {
  const { filters, error } = await loadFilters();

  return (
    <>
      <div className="page-head">
        <h1>Results viewer</h1>
        <p>Browse results by parish within your deanery. Filter by term, course, or module.</p>
      </div>
      <div className="card panel">
        {error && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{error}</div>}
        {!error && filters && <ResultsTable filters={filters} />}
      </div>
    </>
  );
}