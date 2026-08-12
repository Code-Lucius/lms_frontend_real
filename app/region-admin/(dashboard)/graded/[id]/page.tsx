import { GradeDetailReadOnly } from "@/components/region-admin/GradeDetailReadOnly";

export default function Page({ params }: { params: { id: string } }) {
  return <GradeDetailReadOnly submissionId={params.id} />;
}