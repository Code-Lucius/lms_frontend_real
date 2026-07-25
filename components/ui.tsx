import { ReactNode } from "react";
import type { SubState } from "@/lib/data";
import { IconCheck, IconAlert } from "@/components/icons";

const BADGE: Record<string, [string, string]> = {
  active: ["b-active", "Active"],
  open: ["b-open", "Open"],
  closed: ["b-closed", "Window closed"],
  pending: ["b-pending", "Pending"],
  expired: ["b-closed", "Expired"],
  suspended: ["b-closed", "Suspended"],
  graded: ["b-active", "Graded"],
};

export function Badge({ state, label }: { state: SubState | string; label?: string }) {
  const [cls, txt] = BADGE[state] ?? ["b-pending", state];
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label ?? txt}
    </span>
  );
}

export function Card({ className = "", children, style }: { className?: string; children: ReactNode; style?: React.CSSProperties }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

export function StatCard({ lab, val, un, meta }: { lab: string; val: ReactNode; un?: string; meta: string }) {
  return (
    <div className="card stat">
      <div className="lab">{lab}</div>
      <div className="val">{val}{un ? <span className="un"> {un}</span> : null}</div>
      <div className="meta">{meta}</div>
    </div>
  );
}

export function Lozenge({ style }: { style?: React.CSSProperties }) {
  return <div className="lozenge" style={style}><span /></div>;
}

export function ProgressBar({ value, style }: { value: number; style?: React.CSSProperties }) {
  return <div className="prog" style={style}><span style={{ width: `${value}%` }} /></div>;
}

export type Segment = { label: string; value: number; color: string };

export function Donut({ segments, size = 150 }: { segments: Segment[]; size?: number }) {
  const r = size / 2 - 12, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--limestone-deep)" strokeWidth={14} />
      {segments.map((s, i) => {
        const len = (s.value / total) * C;
        const dash = `${len} ${C - len}`;
        const off = -acc;
        acc += len;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14} strokeDasharray={dash} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`} />;
      })}
    </svg>
  );
}

export function DonutLegend({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="donut-legend">
      {segments.map((s, i) => (
        <div className="lr" key={i}>
          <span className="sw" style={{ background: s.color }} />
          {s.label}
          <b>{Math.round((s.value / total) * 100)}%</b>
        </div>
      ))}
    </div>
  );
}

export function Bars({ rows }: { rows: [string, number][] }) {
  return (
    <>
      {rows.map(([n, v], i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>{n}</span><b>{v}%</b></div>
          <ProgressBar value={v} />
        </div>
      ))}
    </>
  );
}

export function SubBanner({ active }: { active: boolean }) {
  return active ? (
    <div className="subbar ok"><IconCheck className="ic" /> Your parish subscription is active. All courses and exams are available.</div>
  ) : (
    <div className="subbar warn"><IconAlert className="ic" /> Your parish subscription is currently inactive. Please contact your parish admin.</div>
  );
}

export function Person({ name, email }: { name: string; email?: string }) {
  const initials = name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  return (
    <div className="person">
      <div className="av">{initials}</div>
      {email ? <div><div style={{ fontWeight: 600 }}>{name}</div><div className="em">{email}</div></div> : <span>{name}</span>}
    </div>
  );
}
