import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { NAV } from "@/components/region-admin/nav";

export default async function RegionAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session || session.role !== "region-admin") {
    redirect("/region-admin/login");
  }

  return (
    <AppShell brandTitle="Lagos Region" brandSub="Region admin" nav={NAV} who={{ name: session.name ?? "Admin", role: "Region admin" }}>
      {children}
    </AppShell>
  );
}
