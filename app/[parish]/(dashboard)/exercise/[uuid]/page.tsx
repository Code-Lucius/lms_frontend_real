import { Exercise } from "@/components/parishioner/Exercise";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string; uuid: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  return (
    <Exercise
      uuid={params.uuid}
      parishName={row ? row.p : params.parish}
      parishSlug={params.parish}
    />
  );
}
