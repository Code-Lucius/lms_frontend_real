import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { getNav } from "@/components/parish-admin/nav";
import { SubBar } from "@/components/parish-admin/SubBar";
import { subRows } from "@/lib/data";

export default async function ParishAdminLayout({ children, params }: { children: ReactNode; params: { parish: string } }) {
  const { parish } = params;
  const session = await auth();

  if (!session || session.role !== "parish-admin" || session.parishSlug !== parish) {
    redirect(`/${parish}/admin/login`);
  }

  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : parish;

  return (
    <AppShell brandTitle={parishName} brandSub="Parish admin" nav={getNav(parish)} who={{ name: session.name ?? "Admin", role: "Parish admin" }}>
      <SubBar />
      {children}
    </AppShell>
  );
}
