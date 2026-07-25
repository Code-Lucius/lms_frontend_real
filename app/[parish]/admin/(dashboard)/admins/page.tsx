import { Admins } from "@/components/parish-admin/Admins";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string } }) {
  const row = subRows.find((r) => r.slug === params.parish);
  return <Admins parishName={row ? row.p : params.parish} />;
}
