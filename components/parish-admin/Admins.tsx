// import { Person } from "@/components/ui";

// const parishAdmins = [
//   { n: "John Adeyemi", e: "john.adeyemi@stpeter.org", role: "Lead admin" },
//   { n: "Agnes Okoro", e: "agnes.okoro@stpeter.org", role: "Admin" },
// ];

// export function Admins({ parishName }: { parishName: string }) {
//   return (
//     <>
//       <div className="page-head"><h1>Parish admins</h1><p>Add or remove admins for the Parish of {parishName}. Each new admin receives a verification link by email.</p></div>
//       <div className="grid-2">
//         <div className="card panel">
//           <h2>Current admins</h2><div className="sub">{parishAdmins.length} people manage this parish</div>
//           {parishAdmins.map((a) => (
//             <div key={a.e} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
//               <Person name={a.n} email={a.e} /><span className="spacer" /><span className="slug-tag">{a.role}</span>
//             </div>
//           ))}
//         </div>
//         <div className="card panel">
//           <h2>Add an admin</h2><div className="sub">They&rsquo;ll set their own password via the link</div>
//           <div className="field"><label>Full name</label><input placeholder="e.g. Peter Nwosu" /></div>
//           <div className="field"><label>Email</label><input type="email" placeholder="name@stpeter.org" /></div>
//           <button className="btn btn-primary btn-sm">Send invitation</button>
//         </div>
//       </div>
//     </>
//   );
// }
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Person } from "@/components/ui";

interface ParishAdminRecord {
  uuid: string;
  name: string;
  email: string;
  type?: string | null;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total?: number;
}

// Assumption: "super_admin" is the lead admin; anything else is a regular admin.
function roleLabel(type?: string | null) {
  return type === "super_admin" ? "Lead admin" : "Admin";
}

export function Admins({
  parishName,
  parishSlug,
  canManage = true, // the backend is the real gate; it returns 403 for non-lead admins
}: {
  parishName: string;
  parishSlug: string;
  canManage?: boolean;
}) {
  const [admins, setAdmins] = useState<ParishAdminRecord[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ParishAdminRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const requestIdRef = useRef(0); // drops stale responses if pages change quickly
  const slugParam = encodeURIComponent(parishSlug);

  const loadAdmins = useCallback(
    async (p: number) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setListError(null);
      try {
        const res = await fetch(`/api/parish-admins?parish=${slugParam}&page=${p}`, { cache: "no-store" });
        const json = await res.json();
        if (requestIdRef.current !== requestId) return;
        if (!res.ok) {
          setListError(json.message ?? "Failed to load parish admins.");
          setAdmins([]);
          return;
        }
        // The list endpoint returns { admins: <paginator> }; fall back to { data: <paginator> }.
        const paginated: Paginated<ParishAdminRecord> = json.admins ?? json.data;
        setAdmins(paginated?.data ?? []);
        setPage(paginated?.current_page ?? 1);
        setLastPage(paginated?.last_page ?? 1);
        setTotal(paginated?.total ?? null);
      } catch {
        if (requestIdRef.current !== requestId) return;
        setListError("Unable to reach the server.");
      } finally {
        if (requestIdRef.current === requestId) setIsLoading(false);
      }
    },
    [slugParam]
  );

  useEffect(() => {
    loadAdmins(1);
  }, [loadAdmins]);

  function startCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setFormError(null);
    setFieldErrors({});
  }

  function startEdit(a: ParishAdminRecord) {
    setEditing(a);
    setName(a.name);
    setEmail(a.email);
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
    setIsSaving(true);

    try {
      const wasEditing = !!editing;
      const url = editing
        ? `/api/parish-admins/${editing.uuid}?parish=${slugParam}`
        : `/api/parish-admins?parish=${slugParam}`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { name } : { name, email }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 422) {
        setFormError(json.message ?? "Validation failed.");
        setFieldErrors(json.errors ?? {});
        return;
      }
      if (!res.ok) {
        setFormError(json.message ?? "Something went wrong.");
        return;
      }

      startCreate();
      setNotice(wasEditing ? "Admin updated." : "Invitation sent. They'll set their own password via the emailed link.");
      // New admins are listed newest-first, so jump back to page 1 after creating.
      loadAdmins(wasEditing ? page : 1);
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(a: ParishAdminRecord) {
    if (!window.confirm(`Remove ${a.name}? They will lose access to this parish. This can't be undone.`)) return;
    setNotice(null);
    setDeletingUuid(a.uuid);
    try {
      const res = await fetch(`/api/parish-admins/${a.uuid}?parish=${slugParam}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setListError(json.message ?? "Failed to remove admin.");
        return;
      }
      if (editing?.uuid === a.uuid) startCreate();
      // If that was the last row on this page, step back a page.
      loadAdmins(admins.length === 1 && page > 1 ? page - 1 : page);
    } catch {
      setListError("Unable to reach the server.");
    } finally {
      setDeletingUuid(null);
    }
  }

  const count = total ?? admins.length;

  return (
    <>
      <div className="page-head">
        <h1>Parish admins</h1>
        <p>Add or remove admins for the Parish of {parishName}. Each new admin receives a verification link by email.</p>
      </div>
      <div className="grid-2">
        <div className="card panel">
          <h2>Current admins</h2>
          <div className="sub">
            {isLoading ? "Loading..." : `${count} ${count === 1 ? "person manages" : "people manage"} this parish`}
          </div>

          {listError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, margin: "8px 0" }}>{listError}</div>}

          {!isLoading && !admins.length && !listError && <div className="empty">No admins yet.</div>}

          {admins.map((a) => (
            <div
              key={a.uuid}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}
            >
              <Person name={a.name} email={a.email} />
              <span className="spacer" />
              <span className="slug-tag">{roleLabel(a.type)}</span>
              {canManage && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(a)}>Edit</button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={deletingUuid === a.uuid}
                    onClick={() => handleDelete(a)}
                  >
                    {deletingUuid === a.uuid ? "Removing..." : "Remove"}
                  </button>
                </>
              )}
            </div>
          ))}

          {lastPage > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => loadAdmins(page - 1)}>Previous</button>
              <span className="muted" style={{ fontSize: 12.5, alignSelf: "center" }}>Page {page} of {lastPage}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= lastPage} onClick={() => loadAdmins(page + 1)}>Next</button>
            </div>
          )}
        </div>

        {canManage ? (
          <div className="card panel">
            <h2>{editing ? `Edit ${editing.name}` : "Add an admin"}</h2>
            <div className="sub">
              {editing ? "Update their name below" : "They\u2019ll set their own password via the link"}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Peter Nwosu"
                  required
                  disabled={isSaving}
                />
                {fieldErrors.name && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.name[0]}</div>}
              </div>

              {!editing && (
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@stpeter.org"
                    required
                    disabled={isSaving}
                  />
                  {fieldErrors.email && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.email[0]}</div>}
                </div>
              )}

              {formError && <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 10 }}>{formError}</div>}
              {notice && <div role="status" style={{ color: "var(--sage)", fontSize: 12.5, marginBottom: 10 }}>{notice}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : editing ? "Save changes" : "Send invitation"}
                </button>
                {editing && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={startCreate} disabled={isSaving}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="card panel">
            <h2>Add an admin</h2>
            <p className="muted" style={{ fontSize: 13 }}>Only the lead admin can add, edit, or remove admins.</p>
          </div>
        )}
      </div>
    </>
  );
}