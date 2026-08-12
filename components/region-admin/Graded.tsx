// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Badge, Person, StatCard } from "@/components/ui";
// import { IconSearch } from "@/components/icons";

// interface Submission {
//   id: number;
//   exercise_id: number;
//   parishioner_id: number;
//   status: string;
//   submitted_at: string | null;
//   exercise_title: string;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   parish_id: number;
//   region_id: number;
//   parish_name: string;
// }

// interface RegionStats {
//   awaiting_grading: number;
//   awaiting_grading_parishes: number;
//   graded_this_week: number;
//   graded_this_week_avg_score: number | null;
//   active_parishioners: number;
//   active_parishioners_parishes: number;
// }

// interface Paginated<T> {
//   data: T[];
//   current_page: number;
//   last_page: number;
// }

// const [stats, setStats] = useState<RegionStats | null>(null);
// const [statsError, setStatsError] = useState<string | null>(null);

// const loadStats = useCallback(async () => {
//   try {
//     const res = await fetch(`/api/region-admin/stats`, { cache: "no-store" });
//     const json = await res.json();
//     if (!res.ok) {
//       setStatsError(json.message ?? "Failed to load stats.");
//       return;
//     }
//     setStats(json.data);
//   } catch {
//     setStatsError("Unable to reach the server.");
//   }
// }, []);

// useEffect(() => {
//   loadStats();
// }, [loadStats]);

// const QUEUE_STATUS = "graded";

// export function Graded() {
//   const router = useRouter();

//   const [submissions, setSubmissions] = useState<Submission[]>([]);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [listError, setListError] = useState<string | null>(null);

//   const [search, setSearch] = useState("");
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const loadSubmissions = useCallback(async (p: number, q: string) => {
//     setIsLoading(true);
//     setListError(null);
//     try {
//       const params = new URLSearchParams({ page: String(p), status: QUEUE_STATUS });
//       if (q) params.set("search", q);
//       const res = await fetch(`/api/region-admin/results?${params.toString()}`, { cache: "no-store" });
//       const json = await res.json();
//       if (!res.ok) {
//         setListError(json.message ?? "Failed to load submissions.");
//         setSubmissions([]);
//         return;
//       }
//       const paginated: Paginated<Submission> = json.data;
//       setSubmissions(paginated?.data ?? []);
//       setPage(paginated?.current_page ?? 1);
//       setLastPage(paginated?.last_page ?? 1);
//     } catch {
//       setListError("Unable to reach the server.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadSubmissions(1, "");
//   }, [loadSubmissions]);

//   function handleSearchChange(value: string) {
//     setSearch(value);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => loadSubmissions(1, value), 400);
//   }

//   function fullName(s: Submission) {
//     return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
//   }

//   function formatDate(d: string | null) {
//     if (!d) return "\u2014";
//     return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
//   }

//   return (
//     <>
//       <div className="page-head">
//         <div className="eyebrow">Lagos Region</div>
//         <h1>Graded Exercises</h1>
//         <p>All exercises graded by region admins are listed here</p>
//       </div>
//       <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
//         <StatCard lab="Awaiting grading" val="3" meta="across 2 parishes" />
//         <StatCard lab="Graded this week" val="12" meta="avg. score 81%" />
//         <StatCard lab="Active parishioners" val="602" meta="4 parishes" />
//       </div>
//       <div className="card panel">
//         <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
//           <h2 style={{ fontSize: 17, margin: 0 }}>Submissions</h2>
//           <div className="spacer" />
//           <div className="search">
//             <IconSearch width={15} height={15} />
//             <input
//               placeholder="Search by exercise, parish, or parishioner"
//               value={search}
//               onChange={(e) => handleSearchChange(e.target.value)}
//               aria-label="Search submissions"
//             />
//           </div>
//         </div>
//         <div className="sub">Select a submission to open the grading view</div>

//         {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

//         <table className="tbl">
//           <thead><tr><th>Exercise</th><th>Parishioner</th><th>Parish</th><th>Submitted</th><th>Status</th></tr></thead>
//           <tbody>
//             {isLoading ? (
//               <tr><td colSpan={5} className="empty">Loading\u2026</td></tr>
//             ) : submissions.length ? (
//               submissions.map((s) => (
//                 <tr
//                   key={s.id}
//                   className="click"
//                   onClick={() => router.push(`/region-admin/grade/${s.id}`)}
//                 >
//                   <td className="fw5">{s.exercise_title}</td>
//                   <td><Person name={fullName(s)} /></td>
//                   <td className="muted">{s.parish_name}</td>
//                   <td className="muted">{formatDate(s.submitted_at)}</td>
//                   <td><Badge state={s.status} /></td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan={5} className="empty">No submissions awaiting grading.</td></tr>
//             )}
//           </tbody>
//         </table>

//         {lastPage > 1 && (
//           <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
//             <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadSubmissions(page - 1, search)}>Previous</button>
//             <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
//             <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadSubmissions(page + 1, search)}>Next</button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Person, StatCard } from "@/components/ui";
import { IconSearch } from "@/components/icons";

interface Submission {
  id: number;
  exercise_id: number;
  parishioner_id: number;
  status: string;
  submitted_at: string | null;
  exercise_title: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  parish_id: number;
  region_id: number;
  parish_name: string;
}

interface RegionStats {
  awaiting_grading: number;
  awaiting_grading_parishes: number;
  graded_this_week: number;
  graded_this_week_avg_score: number | null;
  active_parishioners: number;
  active_parishioners_parishes: number;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

const QUEUE_STATUS = "graded";

export function Graded() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stats, setStats] = useState<RegionStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/region-admin/stats`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setStatsError(json.message ?? "Failed to load stats.");
        return;
      }
      setStats(json.data);
    } catch {
      setStatsError("Unable to reach the server.");
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadSubmissions = useCallback(async (p: number, q: string) => {
    setIsLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams({ page: String(p), status: QUEUE_STATUS });
      if (q) params.set("search", q);
      const res = await fetch(`/api/region-admin/results?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load submissions.");
        setSubmissions([]);
        return;
      }
      const paginated: Paginated<Submission> = json.data;
      setSubmissions(paginated?.data ?? []);
      setPage(paginated?.current_page ?? 1);
      setLastPage(paginated?.last_page ?? 1);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions(1, "");
  }, [loadSubmissions]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadSubmissions(1, value), 400);
  }

  function fullName(s: Submission) {
    return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
  }

  function formatDate(d: string | null) {
    if (!d) return "\u2014";
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Lagos Region</div>
        <h1>Graded Exercises</h1>
        <p>All exercises graded by region admins are listed here</p>
      </div>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard
          lab="Awaiting grading"
          val={stats ? String(stats.awaiting_grading) : "\u2014"}
          meta={stats ? `across ${stats.awaiting_grading_parishes} parish${stats.awaiting_grading_parishes === 1 ? "" : "es"}` : ""}
        />
        <StatCard
          lab="Graded this week"
          val={stats ? String(stats.graded_this_week) : "\u2014"}
          meta={stats?.graded_this_week_avg_score != null ? `avg. score ${stats.graded_this_week_avg_score}%` : ""}
        />
        <StatCard
          lab="Active parishioners"
          val={stats ? String(stats.active_parishioners) : "\u2014"}
          meta={stats ? `${stats.active_parishioners_parishes} parish${stats.active_parishioners_parishes === 1 ? "" : "es"}` : ""}
        />
      </div>
      {statsError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 12 }}>{statsError}</div>}

      <div className="card panel">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 17, margin: 0 }}>Submissions</h2>
          <div className="spacer" />
          <div className="search">
            <IconSearch width={15} height={15} />
            <input
              placeholder="Search by exercise, parish, or parishioner"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search submissions"
            />
          </div>
        </div>
        <div className="sub">All graded submissions in your region</div>

        {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

        <table className="tbl">
          <thead><tr><th>Exercise</th><th>Parishioner</th><th>Parish</th><th>Submitted</th><th>Status</th></tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="empty">Loading\u2026</td></tr>
            ) : submissions.length ? (
              submissions.map((s) => (
                <tr
                  key={s.id}
                  className="click"
                  onClick={() => router.push(`/region-admin/graded/${s.id}`)}
                >
                  <td className="fw5">{s.exercise_title}</td>
                  <td><Person name={fullName(s)} /></td>
                  <td className="muted">{s.parish_name}</td>
                  <td className="muted">{formatDate(s.submitted_at)}</td>
                  <td><Badge state={s.status} /></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="empty">No graded submissions yet.</td></tr>
            )}
          </tbody>
        </table>

        {lastPage > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadSubmissions(page - 1, search)}>Previous</button>
            <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadSubmissions(page + 1, search)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}