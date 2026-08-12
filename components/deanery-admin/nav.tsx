import type { NavSection } from "@/components/AppShell";
import { IconGrid, IconCheckSquare, IconBars } from "@/components/icons";

export const NAV: NavSection[] = [
  {
    label: "Oversight",
    items: [
      { href: "/deanery-admin", label: "Dashboard", icon: <IconGrid /> },
      { href: "/deanery-admin/results", label: "Results viewer", icon: <IconCheckSquare /> },
      { href: "/deanery-admin/analytics", label: "Analytics", icon: <IconBars /> },
      { href: "/deanery-admin/hierarchy", label: "Hierarchy", icon: <IconBars /> },
      { href: "/deanery-admin/directory", label: "Directory", icon: <IconBars /> },
    ],
  },
];
