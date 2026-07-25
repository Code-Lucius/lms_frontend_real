import { Subscription } from "@/components/parish-admin/Subscription";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  return <Subscription parishName={row ? row.p : params.parish} parishSlug={params.parish} />;
}
