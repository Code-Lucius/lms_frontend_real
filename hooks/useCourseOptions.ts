import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/lib/types";


export function useCourseOptions() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?page=1`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to load courses.");
        return;
      }
      setCourses(json.data?.data ?? []);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { courses, isLoading, error, reload };
}