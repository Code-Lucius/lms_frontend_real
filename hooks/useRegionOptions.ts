import { useCallback, useEffect, useState } from "react";
import type { Region } from "@/lib/types";

// NOTE: Laravel's /view-regions is paginated 20-per-page with no "all" mode,
// so this only loads the first page for the dropdown. Fine while the region
// count is small; if it grows past 20 this needs a searchable/paged picker
// instead of a plain <select>.
export function useRegionOptions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/regions?page=1`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to load regions.");
        return;
      }
      setRegions(json.data?.data ?? []);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { regions, isLoading, error, reload };
}
