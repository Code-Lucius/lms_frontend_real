import { Badge, Person } from "@/components/ui";

export function Results() {
  const rows = [
    { n: "Maria Okonkwo", mod: "Module 2 \u00b7 The Sacraments", ex: "82%", exam: "86%", st: "active" },
    { n: "Daniel Eze", mod: "Module 1 \u00b7 The Creed", ex: "74%", exam: "\u2014", st: "active" },
    { n: "Grace Bello", mod: "Module 2 \u00b7 The Sacraments", ex: "91%", exam: "78%", st: "active" },
    { n: "Ruth Adebayo", mod: "Module 1 \u00b7 The Creed", ex: "Pending", exam: "\u2014", st: "pending" },
  ] as const;
  return (
    <>
      <div className="page-head"><h1>Results</h1><p>Performance for parishioners in your parish. Grading is done by the region admin; you have read access here.</p></div>
      <div className="card panel">
        <table className="tbl"><thead><tr><th>Parishioner</th><th>Current module</th><th>Exercise</th><th>Exam</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}><td><Person name={r.n} /></td><td className="muted">{r.mod}</td><td className="fw6">{r.ex}</td><td className="fw6">{r.exam}</td><td><Badge state={r.st} /></td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
