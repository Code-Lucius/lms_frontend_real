import { GradeView } from "@/components/region-admin/GradeView";

export default function Page({ params }: { params: { id: string } }) {
  return <GradeView submissionId={params.id} />;
}