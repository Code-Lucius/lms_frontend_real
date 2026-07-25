"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { subRows as seedSubs, type SubRow } from "@/lib/data";
import { NAV, CRUMBS, type View } from "./nav";
import { Dash } from "./Dash";
import { Hierarchy } from "./Hierarchy";
import { Subs } from "./Subs";
import { Directory } from "./Directory";
import { Content } from "./Content";
import { Exams } from "./Exams";
import { Admins } from "./Admins";
import { Regions } from "./Regions";
import { RegionAdmins } from "./RegionAdmins";
import { Deaneries } from "./Deaneries";
import { DeaneryAdmins } from "./DeaneryAdmins";

export function ArchdioceseApp({ adminName, canManage }: { adminName: string; canManage: boolean }) {
  const [view, setView] = useState<View>("dash");
  const [subs, setSubs] = useState<SubRow[]>(seedSubs);

  return (
    <AppShell
      brandTitle="Archdiocese"
      brandSub="System admin"
      nav={NAV}
      active={view}
      onSelect={(k) => setView(k as View)}
      who={{ name: adminName, role: "Archdiocese admin" }}
      crumb={CRUMBS[view]}
    >
      {view === "dash" && <Dash subs={subs} openSubs={() => setView("subs")} />}
      {view === "hierarchy" && <Hierarchy />}
      {view === "subs" && <Subs subs={subs} setSubs={setSubs} />}
      {view === "directory" && <Directory />}
      {view === "content" && <Content />}
      {view === "exams" && <Exams />}
      {view === "admins" && <Admins canManage={canManage} />}
      {view === "regions" && <Regions canManage={canManage} />}
      {view === "regionAdmins" && <RegionAdmins canManage={canManage} />}
      {view === "deaneries" && <Deaneries canManage={canManage} />}
      {view === "deaneryAdmins" && <DeaneryAdmins canManage={canManage} />}
    </AppShell>
  );
}
