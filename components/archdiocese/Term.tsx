"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui";
import type { Term } from "@/lib/types";

export function TermPanel({ canManage }: { canManage: boolean }) {
  const [term, setTerm] = useState<Term | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const loadTerm = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/term", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setLoadError(json.message ?? "Failed to load the current term.");
        return;
      }
      setTerm(json.data ?? null);
    } catch {
      setLoadError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerm();
  }, [loadTerm]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setFieldErrors({});
    setIsStarting(true);
    try {
      const res = await fetch("/api/term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (res.status === 422) {
        setActionError(json.message ?? "Validation failed.");
        setFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setActionError(json.message ?? "Something went wrong.");
        return;
      }
      setName("");
      loadTerm();
    } catch {
      setActionError("Unable to reach the server.");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleEnd() {
    if (!window.confirm("End the current term? This can't be undone.")) return;
    setActionError(null);
    setIsEnding(true);
    try {
      const res = await fetch("/api/term/end", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.message ?? "Something went wrong.");
        return;
      }
      loadTerm();
    } catch {
      setActionError("Unable to reach the server.");
    } finally {
      setIsEnding(false);
    }
  }

  const isActive = term?.status === "active";

  return (
    <>
      <div className="page-head">
        <h1>Academic term</h1>
        <p>Only one term can be active at a time. Starting a new term requires the current one to be ended first.</p>
      </div>

      <div className="card panel" style={{ maxWidth: 560 }}>
        {isLoading ? (
          <div className="empty">Loading\u2026</div>
        ) : loadError ? (
          <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5 }}>{loadError}</div>
        ) : term ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "Fraunces", fontSize: 20 }}>{term.name}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>
                  Started {new Date(term.started_at).toLocaleDateString()}
                  {term.ended_at ? ` \u00b7 Ended ${new Date(term.ended_at).toLocaleDateString()}` : ""}
                </div>
              </div>
              <span className="spacer" />
              <Badge state={isActive ? "active" : "closed"} />
            </div>
            {canManage && isActive && (
              <button className="btn btn-ghost btn-sm" disabled={isEnding} onClick={handleEnd}>
                {isEnding ? "Ending\u2026" : "End term"}
              </button>
            )}
          </>
        ) : (
          <div className="empty">No term has been started yet.</div>
        )}

        {canManage && !isLoading && !isActive && (
          <form onSubmit={handleStart} style={{ marginTop: term ? 20 : 0, paddingTop: term ? 20 : 0, borderTop: term ? "1px solid var(--border)" : "none" }}>
            <div className="field">
              <label>New term name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2026/2027 Academic Year" required disabled={isStarting} />
              {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
            </div>
            {actionError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{actionError}</div>}
            <button type="submit" className="btn btn-primary btn-sm" disabled={isStarting}>
              {isStarting ? "Starting\u2026" : "Start term"}
            </button>
          </form>
        )}

        {!canManage && (
          <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>Only super admins can start or end a term.</p>
        )}
      </div>
    </>
  );
}