import { GradeView } from "@/components/region-admin/GradeView";

export default function Page({ params }: { params: { id: string } }) {
  const idx = Number(params.id);
  return <GradeView idx={Number.isFinite(idx) ? idx : -1} />;
}
