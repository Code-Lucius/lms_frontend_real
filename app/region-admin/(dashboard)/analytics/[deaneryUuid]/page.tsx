import { DeaneryAnalytics } from "@/components/region-admin/DeaneryAnalytics";

export default function Page({
  params,
  searchParams,
}: {
  params: { deaneryUuid: string };
  searchParams: { term?: string; course?: string; parish?: string; page?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  return (
    <DeaneryAnalytics
      deaneryUuid={params.deaneryUuid}
      term={searchParams.term}
      course={searchParams.course}
      parish={searchParams.parish}
      page={page}
    />
  );
}