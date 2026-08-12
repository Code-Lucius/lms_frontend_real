"use client";

import { useCallback, useEffect, useState } from "react";
import { SubBanner, Lozenge } from "@/components/ui";
import { Arch } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";

interface AvailableCourse {
  uuid: string;
  name: string;
  total_modules: number;
  is_enrolled: boolean;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

export function Dash({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();

  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [enrollingUuid, setEnrollingUuid] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/parishioner/courses?parish=${parishSlug}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load courses.");
        setAvailableCourses([]);
        return;
      }
      const paginated: Paginated<AvailableCourse> = json.data;
      setAvailableCourses(paginated?.data ?? []);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [parishSlug]);

  useEffect(() => {
    if (active) loadCourses();
  }, [active, loadCourses]);

async function handleEnrol(course: AvailableCourse) {
  setEnrollError(null);
  setEnrollingUuid(course.uuid);
  try {
    const res = await fetch(`/api/parishioner/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_uuid: course.uuid, parish_slug: parishSlug }),
    });
    const json = await res.json();
    if (!res.ok) {
      setEnrollError(json.message ?? `Could not enrol in ${course.name}.`);
      return;
    }
    setAvailableCourses((prev) =>
      prev.map((c) => (c.uuid === course.uuid ? { ...c, is_enrolled: true } : c))
    );
  } catch {
    setEnrollError("Unable to reach the server.");
  } finally {
    setEnrollingUuid(null);
  }
}

  if (!active) return <Gate parishName={parishName} />;

  const enrolledCount = availableCourses.filter((c) => c.is_enrolled).length;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head">
        <Arch width={92} height={20} style={{ marginBottom: 8 }} />
        <h1>Peace be with you.</h1>
      </div>
      <h2 style={{ fontFamily: "Fraunces", fontSize: 20, marginBottom: 4 }}>Available Courses</h2>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 0 16px" }}>
        Courses open to your parish. Enrolment is available while your subscription is active.
      </p>

      {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 12 }}>{listError}</div>}
      {enrollError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 12 }}>{enrollError}</div>}

      <div className="enrol-grid">
        {isLoading ? (
          <p className="muted">Loading\u2026</p>
        ) : availableCourses.length ? (
          availableCourses.map((c) => (
            <div className="card enrol" key={c.uuid}>
              <div className="en">{c.name}</div>
              <div className="ed">{c.total_modules} module{c.total_modules === 1 ? "" : "s"}</div>
              {c.is_enrolled ? (
                <button
                  className="btn btn-sm"
                  style={{ alignSelf: "flex-start", background: "var(--sage-soft)", color: "var(--sage)" }}
                  disabled
                >
                  Enrolled &#10003;
                </button>
              ) : (
                <button
                  className="btn btn-brass btn-sm"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => handleEnrol(c)}
                  disabled={enrollingUuid === c.uuid}
                >
                  {enrollingUuid === c.uuid ? "Enrolling\u2026" : "Enrol"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="muted">No courses are currently available to enrol in.</p>
        )}
      </div>
    </>
  );
}