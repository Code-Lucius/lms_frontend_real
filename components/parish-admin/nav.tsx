import type { NavSection } from "@/components/AppShell";
import { IconUsers, IconBars, IconUserPlus, IconCard } from "@/components/icons";

// Routes are scoped under /{parish}/admin/... so the nav config depends on
// the current parish slug and can't be a static constant like the other
// dashboards.
export function getNav(parish: string): NavSection[] {
  return [
    {
      label: "Manage",
      items: [
        { href: `/${parish}/admin`, label: "Parishioners", icon: <IconUsers /> },
        { href: `/${parish}/admin/results`, label: "Results", icon: <IconBars /> },
        { href: `/${parish}/admin/admins`, label: "Parish admins", icon: <IconUserPlus /> },
        { href: `/${parish}/admin/subscription`, label: "Subscription", icon: <IconCard /> },
      ],
    },
  ];
}
