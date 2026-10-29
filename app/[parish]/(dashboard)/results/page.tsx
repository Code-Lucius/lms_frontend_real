import { Results } from "@/components/parishioner/Results";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string; examUuid: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  return <Results parishName={row ? row.p : params.parish} parishSlug={params.parish}/>;
}
