import type { ParishResultRow } from "@/lib/types";

export function ExerciseCell({
  r,
}: {
  r: Pick<ParishResultRow, "exercise_percentage" | "exercise_earned" | "exercise_possible" | "exercise_pending">;
}) {
  if (r.exercise_percentage !== null) {
    return (
      <>
        <span className="fw6">{r.exercise_percentage}%</span>
        <div className="muted" style={{ fontSize: 12 }}>
          {r.exercise_earned}/{r.exercise_possible} marks{r.exercise_pending ? ` · ${r.exercise_pending} pending` : ""}
        </div>
      </>
    );
  }
  if (r.exercise_pending > 0) return <span className="fw6">Pending</span>;
  return <>—</>;
}

const STATUS = {
  passed: ["b-active", "Passed"],
  failed: ["b-closed", "Not yet passed"],
  in_progress: ["b-pending", "In progress"],
} as const;

export function StatusBadge({ status }: { status: ParishResultRow["status"] }) {
  const [cls, label] = STATUS[status];
  return <span className={`badge ${cls}`}><span className="dot" />{label}</span>;
}