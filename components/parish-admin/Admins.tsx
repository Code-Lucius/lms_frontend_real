import { Person } from "@/components/ui";

const parishAdmins = [
  { n: "John Adeyemi", e: "john.adeyemi@stpeter.org", role: "Lead admin" },
  { n: "Agnes Okoro", e: "agnes.okoro@stpeter.org", role: "Admin" },
];

export function Admins({ parishName }: { parishName: string }) {
  return (
    <>
      <div className="page-head"><h1>Parish admins</h1><p>Add or remove admins for the Parish of {parishName}. Each new admin receives a verification link by email.</p></div>
      <div className="grid-2">
        <div className="card panel">
          <h2>Current admins</h2><div className="sub">{parishAdmins.length} people manage this parish</div>
          {parishAdmins.map((a) => (
            <div key={a.e} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <Person name={a.n} email={a.e} /><span className="spacer" /><span className="slug-tag">{a.role}</span>
            </div>
          ))}
        </div>
        <div className="card panel">
          <h2>Add an admin</h2><div className="sub">They&rsquo;ll set their own password via the link</div>
          <div className="field"><label>Full name</label><input placeholder="e.g. Peter Nwosu" /></div>
          <div className="field"><label>Email</label><input type="email" placeholder="name@stpeter.org" /></div>
          <button className="btn btn-primary btn-sm">Send invitation</button>
        </div>
      </div>
    </>
  );
}
