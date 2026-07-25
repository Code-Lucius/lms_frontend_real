import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { getNav } from "@/components/parishioner/nav";
import { subRows } from "@/lib/data";

export default async function ParishionerLayout({ children, params }: { children: ReactNode; params: { parish: string } }) {
  const { parish } = params;
  const session = await auth();

  if (!session || session.role !== "parishioner" || session.parishSlug !== parish) {
    redirect(`/${parish}/login`);
  }

  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : parish;

  return (
    <AppShell brandTitle={parishName} brandSub="Parishioner" nav={getNav(parish)} who={{ name: session.name ?? "Parishioner", role: "Parishioner" }}>
      {children}
    </AppShell>
  );
}
