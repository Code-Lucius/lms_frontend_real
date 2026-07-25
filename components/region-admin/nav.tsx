import type { NavSection } from "@/components/AppShell";
import { IconCheckSquare, IconBars } from "@/components/icons";

export const NAV: NavSection[] = [
  {
    label: "Grading",
    items: [
      { href: "/region-admin", label: "Grading queue", icon: <IconCheckSquare /> },
      { href: "/region-admin/analytics", label: "Analytics", icon: <IconBars /> },
    ],
  },
];
