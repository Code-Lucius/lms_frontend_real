// "use client";

// import { useState } from "react";
// import { Badge, Person } from "@/components/ui";
// import { IconSearch } from "@/components/icons";
// import { parishioners } from "@/lib/data";

// export function People({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
//   const [q, setQ] = useState("");
//   const list = parishioners.filter((p) => p.n.toLowerCase().includes(q.toLowerCase()) || p.e.toLowerCase().includes(q.toLowerCase()));
//   return (
//     <>
//       <div className="page-head"><div className="eyebrow">Parish of {parishName} &middot; {parishSlug}</div><h1>Parishioners</h1><p>Add members, send verification links, and follow their progress.</p></div>
//       <div className="card panel">
//         <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
//           <div className="search"><IconSearch width={15} height={15} /><input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search parishioners" /></div>
//           <div className="spacer" />
//           <button className="btn btn-primary btn-sm">+ Add parishioner</button>
//         </div>
//         <table className="tbl"><thead><tr><th>Parishioner</th><th>Phone</th><th>Enrolment</th><th>Status</th></tr></thead>
//           <tbody>
//             {list.length ? list.map((p, i) => (
//               <tr key={i}><td><Person name={p.n} email={p.e} /></td><td className="muted">{p.ph}</td><td className="muted">{p.en}</td><td><Badge state={p.st} /></td></tr>
//             )) : <tr><td colSpan={4} className="empty">No parishioners match that search.</td></tr>}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Person } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import type { Parishioner, Paginated } from "@/lib/types";

export function People({ parishName, parishSlug }: { parishName: string; parishSlug: string }) {
  const [q, setQ] = useState("");
  const [parishioners, setParishioners] = useState<Parishioner[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const loadParishioners = useCallback(
    async (p: number) => {
      setIsLoading(true);
      setListError(null);
      try {
        const res = await fetch(`/api/parishioners?parish=${parishSlug}&page=${p}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          setListError(json.message ?? "Failed to load parishioners.");
          setParishioners([]);
          return;
        }
        const paginated: Paginated<Parishioner> = json.parishioners;
        setParishioners(paginated?.data ?? []);
        setPage(paginated?.current_page ?? 1);
        setLastPage(paginated?.last_page ?? 1);
      } catch {
        setListError("Unable to reach the server.");
      } finally {
        setIsLoading(false);
      }
    },
    [parishSlug]
  );

  useEffect(() => {
    loadParishioners(1);
  }, [loadParishioners]);

  const list = parishioners.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q.toLowerCase()) ||
      p.email.toLowerCase().includes(q.toLowerCase())
  );

  function openModal() {
    setFirstName("");
    setLastName("");
    setMiddleName("");
    setEmail("");
    setPhone("");
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return; // don't let backdrop/esc dismiss mid-submit
    setModalOpen(false);
  }

  useEffect(() => {
    if (modalOpen) firstFieldRef.current?.focus();
  }, [modalOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (modalOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, isSaving]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const res = await fetch(`/api/parishioners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parish_slug: parishSlug,
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName || null,
          email,
          phone,
        }),
      });

      const json = await res.json();

      if (res.status === 422) {
        setFormError(json.message ?? "Validation failed.");
        setFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setFormError(json.message ?? "Something went wrong.");
        return;
      }

      setModalOpen(false);
      loadParishioners(page);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Parish of {parishName} &middot; {parishSlug}</div>
        <h1>Parishioners</h1>
        <p>Add members, send verification links, and follow their progress.</p>
      </div>
      <div className="card panel">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="search">
            <IconSearch width={15} height={15} />
            <input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search parishioners" />
          </div>
          <div className="spacer" />
          <button className="btn btn-primary btn-sm" onClick={openModal}>+ Add parishioner</button>
        </div>

        {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 12 }}>{listError}</div>}

        <table className="tbl">
          <thead><tr><th>Parishioner</th><th>Phone</th><th>Enrolment</th><th>Status</th></tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="empty">Loading\u2026</td></tr>
            ) : list.length ? (
              list.map((p) => (
                <tr key={p.uuid ?? p.email}>
                  <td><Person name={`${p.first_name} ${p.last_name}`} email={p.email} /></td>
                  <td className="muted">{p.phone}</td>
                  <td className="muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td><Badge state={p.deactivated === "no" ? "active" : "pending"} /></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="empty">No parishioners match that search.</td></tr>
            )}
          </tbody>
        </table>

        {lastPage > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadParishioners(page - 1)}>Previous</button>
            <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadParishioners(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          role="presentation"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-parishioner-title"
            onClick={(e) => e.stopPropagation()}
            className="card panel"
            style={{ width: "100%", maxWidth: 440, margin: 16 }}
          >
            <h2 id="add-parishioner-title" style={{ fontSize: 17 }}>Add parishioner</h2>
            <div className="sub">They&rsquo;ll receive an email to set their own password.</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>First name</label>
                <input ref={firstFieldRef} value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSaving} />
                {fieldErrors.first_name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.first_name[0]}</div>}
              </div>
              <div className="field">
                <label>Middle name</label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} disabled={isSaving} />
                {fieldErrors.middle_name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.middle_name[0]}</div>}
              </div>
              <div className="field">
                <label>Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isSaving} />
                {fieldErrors.last_name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.last_name[0]}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving} />
                {fieldErrors.email && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.email[0]}</div>}
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 08012345678" required disabled={isSaving} />
                {fieldErrors.phone && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.phone[0]}</div>}
              </div>

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? "Adding\u2026" : "Add & send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}