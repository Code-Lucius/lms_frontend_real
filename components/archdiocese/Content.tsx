import { IconFolder } from "@/components/icons";
import { courseContent, examQ } from "@/lib/data";

export function Content() {
  const topics = courseContent[0].topics;
  return (
    <>
      <div className="page-head"><h1>Content studio</h1><p>The course hierarchy: Course &rarr; Module &rarr; Topic &rarr; Material, plus exercises and exam questions.</p></div>
      <div className="grid-2">
        <div>
          <div className="card panel" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><h2>Foundations of Catechesis</h2><div className="sub" style={{ margin: 0 }}>Course &middot; 3 modules &middot; Catechetical Office</div></div><button className="btn btn-ghost btn-sm">+ Add module</button></div>
          </div>
          <div className="topic">
            <div className="th"><span className="kind" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brass)", fontWeight: 600 }}>Module 2</span><span className="tn">The Sacraments</span><span className="tc">Pass 70%</span></div>
            {topics.map((tp, ti) => (
              <div key={ti} style={{ borderTop: "1px solid var(--border)" }}>
                <div className="matrow" style={{ background: "var(--limestone)" }}><IconFolder width={14} height={14} style={{ color: "var(--brass)" }} /><span className="mname">{tp.t}</span><span className="open">+ Material</span></div>
                {tp.mats.map((m, mi) => (<div className="matrow" key={mi}><span className={`mtype ${m.ty}`}>{m.ty}</span><span className="mname" style={{ fontWeight: 400 }}>{m.n}</span><span className="tc faint" style={{ fontSize: 12 }}>{m.len}</span></div>))}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card panel" style={{ marginBottom: 18 }}>
            <h2>Exam questions</h2><div className="sub">Module 2 &middot; The Sacraments &middot; {examQ.length} questions</div>
            {examQ.slice(0, 3).map((q, i) => (<div className="modrow" key={i}><div style={{ flex: 1, paddingRight: 10 }}><span className="mn" style={{ fontWeight: 500, fontSize: 13 }}>{i + 1}. {q.t}</span><div className="pm">{q.opts.length} options &middot; {q.m} marks &middot; auto-graded</div></div></div>))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>+ Add exam question</button>
          </div>
          <div className="card panel">
            <h2>Quick create</h2><div className="sub">Build the hierarchy from the top</div>
            <div className="field"><label>New course name</label><input placeholder="e.g. Sacred Scripture II" /></div>
            <div className="field"><label>Module pass mark (%)</label><input type="number" defaultValue={70} /></div>
            <button className="btn btn-primary btn-sm">Create course</button>
          </div>
        </div>
      </div>
    </>
  );
}
