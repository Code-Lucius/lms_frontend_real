import { Results } from "@/components/parish-admin/Results";

export default function Page({
  params,
  searchParams,
}: {
  params: { parish: string };
  searchParams: { term?: string; course?: string; module?: string; page?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  return (
    <Results
      parishSlug={params.parish}
      term={searchParams.term}
      course={searchParams.course}
      moduleUuid={searchParams.module}
      page={page}
    />
  );
}