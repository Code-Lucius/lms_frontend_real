import { ExamRun } from "@/components/parishioner/ExamRun";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  return <ExamRun parishName={row ? row.p : params.parish} parishSlug={params.parish} />;
}
