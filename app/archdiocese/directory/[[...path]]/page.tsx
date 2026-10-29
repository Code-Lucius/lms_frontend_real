import { Directory } from "@/components/archdiocese/Directory";

export default function Page({
  params,
  searchParams,
}: {
  params: { path?: string[] };
  searchParams: { page?: string; search?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const search = (searchParams.search ?? "").trim().slice(0, 100);
  return <Directory path={params.path ?? []} page={page} search={search} />;
}