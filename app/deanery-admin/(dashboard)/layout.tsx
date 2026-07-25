import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { NAV } from "@/components/deanery-admin/nav";

export default async function DeaneryAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session || session.role !== "deanery-admin") {
    redirect("/deanery-admin/login");
  }

  return (
    <AppShell brandTitle="Ikeja Deanery" brandSub="Deanery admin" nav={NAV} who={{ name: session.name ?? "Admin", role: "Deanery admin" }}>
      {children}
    </AppShell>
  );
}
