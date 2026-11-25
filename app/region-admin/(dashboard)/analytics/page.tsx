import { Analytics } from "@/components/region-admin/Analytics";

export default function Page({
  searchParams,
}: {
  searchParams: { term?: string; course?: string; page?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  return <Analytics term={searchParams.term} course={searchParams.course} page={page} />;
}