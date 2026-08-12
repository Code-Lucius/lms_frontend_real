import type { NavSection } from "@/components/AppShell";
import { IconGrid, IconDoc, IconClock, IconBars } from "@/components/icons";

// /{parish}/course/[idx] and /{parish}/exam/run aren't listed here on purpose -
// they aren't nav destinations themselves, but findActiveNavItem's prefix
// matching still highlights "My courses" / "Exam centre" while on them,
// same as the old activeKey mapping did.
export function getNav(parish: string): NavSection[] {
  return [
    {
      label: "Learning",
      items: [
        { 
          href: `/${parish}`, 
          label: "My courses", 
          icon: <IconGrid />,
          children: [
            { href: `/${parish}/courses`, label: "All Courses", icon: <IconGrid /> },
            { href: `/${parish}`, label: "My Courses", icon: <IconGrid /> },
          ],
        },
        { href: `/${parish}/exercise`, label: "Exercises", icon: <IconDoc /> },
        { href: `/${parish}/exam`, label: "Exam centre", icon: <IconClock /> },
        { href: `/${parish}/results`, label: "My results", icon: <IconBars /> },
      ],
    },
  ];
}
