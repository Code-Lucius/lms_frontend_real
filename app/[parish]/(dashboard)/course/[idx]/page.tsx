import { CourseDetail } from "@/components/parishioner/CourseDetail";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string; idx: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  const idx = Number(params.idx);
  return <CourseDetail idx={Number.isFinite(idx) ? idx : -1} parishName={row ? row.p : params.parish} parishSlug={params.parish} />;
}
