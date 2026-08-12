"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, SubBanner, ProgressBar, Lozenge } from "@/components/ui";
import { Arch } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";

interface MyCourseModule {
  id: number;
  uuid:string;
  course_id: number;
  name: string;
  pass_mark: number;
}

interface MyCourse {
  uuid: string;
  name: string;
  total_modules: number;
  modules: MyCourseModule[];
}

export function Dash({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const { active } = useSubscription();

  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadMyCourses = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetch(`/api/parishioner/my-courses?parish=${parishSlug}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setListError(json.message ?? "Failed to load your courses.");
        setCourses([]);
        return;
      }
      setCourses(Array.isArray(json.data) ? json.data : []);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [parishSlug]);

  useEffect(() => {
    if (active) loadMyCourses();
  }, [active, loadMyCourses]);

  if (!active) return <Gate parishName={parishName} />;

  return (
    <>
      <SubBanner active={active} />
      <div className="page-head">
        <Arch width={92} height={20} style={{ marginBottom: 8 }} />
        <h1>Peace be with you.</h1>
        <p>You&rsquo;re enrolled in {courses.length} course{courses.length === 1 ? "" : "s"}.</p>
      </div>

      {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 12 }}>{listError}</div>}

      {isLoading ? (
        <p className="muted">Loading\u2026</p>
      ) : courses.length ? (
        <div className="courses-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {courses.map((co) => (
            <div className="course" key={co.uuid}>
              <div className="top">
                <div>
                  <h3>{co.name}</h3>
                  <div className="meta">{co.total_modules} module{co.total_modules === 1 ? "" : "s"}</div>
                </div>
                {/* <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}/course/${co.uuid}`}>Open course</Link> */}
              </div>
              {/* Placeholder: course-level progress isn't in this endpoint's response yet */}
              <div className="prog-row"><span>Progress</span><span>&mdash;</span></div>
              <ProgressBar value={0} />
              <div className="modlist">
                {co.modules.map((m, i) => (
                  <div className="modrow" key={m.id}>
                    <div>
                      <span className="mn">Module {i + 1}: {m.name}</span>
                      <div className="pm">Pass mark {m.pass_mark}%</div>
                    </div>
                    {/* Placeholder: exam/module status isn't in this endpoint's response yet */}
                    {/* <Badge state="pending" /> */}
                    <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}/module/${m.uuid}`}>Open module</Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">You&rsquo;re not enrolled in any courses yet.</p>
      )}
    </>
  );
}