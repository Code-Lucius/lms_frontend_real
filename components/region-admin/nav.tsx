import type { NavSection } from "@/components/AppShell";
import { IconCheckSquare, IconBars } from "@/components/icons";

export const NAV: NavSection[] = [
  {
    label: "Grading",
    items: [
      {
        href: "/region-admin", // group toggle key only - never itself a page
        label: "Grading",
        icon: <IconCheckSquare />,
        children: [
          { href: "/region-admin", label: "Grading queue", icon: <IconCheckSquare /> },
          { href: "/region-admin/graded", label: "Graded", icon: <IconCheckSquare /> },
        ],
      },
      { href: "/region-admin/analytics", label: "Analytics", icon: <IconBars /> },
      { href: "/region-admin/hierarchy", label: "Hierarchy", icon: <IconBars /> },
      { href: "/region-admin/directory", label: "Directory", icon: <IconBars /> },
    ],
  },
];
