import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { NAV } from "@/components/archdiocese/nav";

export default async function ArchdioceseLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  // Defensive - middleware already guards this route, but a Server Component
  // shouldn't assume it was reached correctly.
  if (!session || session.role !== "system-admin") {
    redirect("/archdiocese-admin/login");
  }

  return (
    <AppShell brandTitle="Archdiocese" brandSub="System admin" nav={NAV} who={{ name: session.name ?? "Admin", role: "Archdiocese admin" }}>
      {children}
    </AppShell>
  );
}
