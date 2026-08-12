"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SubBanner, ProgressBar } from "@/components/ui";
import { IconDoc } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";
import { Gate } from "./Gate";


interface ModuleMaterial {
  id: number;
  topic_id: number;
  uuid: string;
  name: string;
  type: string;
  file_url: string | null;
}

interface ModuleExercise {
  id: number;
  topic_id: number;
  uuid: string;
}

interface ModuleTopic {
  id: number;
  module_id: number;
  name: string;
  materials_count: number;
  materials: ModuleMaterial[];
  exercise: ModuleExercise | null;
}

interface ModuleData {
  id: number;
  uuid: string;
  name: string;
  topics: ModuleTopic[];
}

export function ModuleDetail({ uuid, parishName, parishSlug }: { uuid: string; parishName: string; parishSlug: string }) {
  const { active } = useSubscription();

  const [module, setModule] = useState<ModuleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadModule = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/parishioner/module/${uuid}?parish=${parishSlug}`, { method: "GET", cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setLoadError(json.message ?? "That module couldn't be found.");
        setModule(null);
        return;
      }
      console.log(json.data);
      setModule(json.data ?? null);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    if (active && uuid) loadModule();
  }, [active, uuid, loadModule]);

  if (!active) return <Gate parishName={parishName} />;

  if (isLoading) {
    return <p className="muted">Loading\u2026</p>;
  }

  if (loadError || !module) {
    return (
      <div className="card panel">
        <p>{loadError ?? "That module couldn't be found."}</p>
        <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      </div>
    );
  }

  return (
    <>
      <SubBanner active={active} />
      <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}`}>&larr; My courses</Link>
      <div className="page-head" style={{ marginTop: 16 }}>
        <h1>{module.name}</h1>
        <p>Work through each topic&rsquo;s materials, complete the exercises, then sit the module exam when its window opens.</p>
      </div>
      {/* Placeholder: module/course progress isn't in this endpoint's response yet */}
      <div className="prog-row" style={{ maxWidth: 420 }}><span>Module progress</span><span>&mdash;</span></div>
      <ProgressBar value={0} style={{ maxWidth: 420, marginBottom: 24 }} />

      {module.topics.map((tp, ti) => (
        <div className="topic" key={tp.id}>
          <div className="th">
            <IconDoc width={16} height={16} style={{ color: "var(--brass)" }} />
            <span className="tn">Topic {ti + 1}: {tp.name}</span>
            <span className="tc">{tp.materials_count} material{tp.materials_count === 1 ? "" : "s"}</span>
          </div>

          {tp.materials.map((m) => (
            <div className="matrow" key={m.uuid}>
              <span className={`mtype ${m.type}`}>{m.type}</span>
              <span className="mname" style={{ fontWeight: 400 }}>{m.name}</span>

              {m.type === "video" && m.file_url && (
                <video controls preload="metadata" style={{ maxWidth: 280, display: "block" }}>
                  <source src={m.file_url} />
                </video>
              )}

              {m.type === "audio" && m.file_url && (
                <audio controls preload="metadata" style={{ display: "block" }}>
                  <source src={m.file_url} />
                </audio>
              )}

              {m.type === "image" && m.file_url && (
                <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                  <img src={m.file_url} alt={m.name} style={{ maxWidth: 160, display: "block", borderRadius: 6 }} />
                </a>
              )}

              {m.type === "document" && m.file_url && (
                <a className="open" href={m.file_url} target="_blank" rel="noopener noreferrer">
                  Open &rarr;
                </a>
              )}

              {!m.file_url && (
                <span className="tc faint" style={{ fontSize: 12 }} title="File not available">&mdash;</span>
              )}

              {m.file_url && (
                <a href={m.file_url} download className="tc faint" style={{ fontSize: 12 }}>
                  Download
                </a>
              )}
            </div>
          ))}

          {tp.exercise && (
            <div style={{ marginTop: 8 }}>
              <Link className="btn btn-ghost btn-sm" href={`/${parishSlug}/exercise/${tp.exercise.uuid}`}>
                Go to this topic&rsquo;s exercise
              </Link>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link className="btn btn-ghost" href={`/${parishSlug}/exercise`}>Go to exercises</Link>
        <Link className="btn btn-primary" href={`/${parishSlug}/exam`}>View exam windows</Link>
      </div>
    </>
  );
}