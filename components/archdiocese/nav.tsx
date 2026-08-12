import type { NavSection } from "@/components/AppShell";
import { IconGrid, IconTree, IconCard, IconUsers, IconFolder, IconCalendar, IconUserPlus, IconBars, IconCheckSquare, IconDoc } from "@/components/icons";

export const NAV: NavSection[] = [
  {
    label: "Oversight",
    items: [
      { href: "/archdiocese", label: "Dashboard", icon: <IconGrid /> },
      { href: "/archdiocese/hierarchy", label: "Hierarchy", icon: <IconTree /> },
      { href: "/archdiocese/subscriptions", label: "Subscriptions", icon: <IconCard /> },
      { href: "/archdiocese/directory", label: "Student directory", icon: <IconUsers /> },
    ],
  },
  {
    label: "Structure",
    items: [
      {
        href: "/archdiocese/region", // group toggle key only - never itself a page
        label: "Region",
        icon: <IconTree />,
        children: [
          { href: "/archdiocese/regions", label: "Regions", icon: <IconGrid /> },
          { href: "/archdiocese/region-admins", label: "Region admins", icon: <IconUserPlus /> },
        ],
      },
      {
        href: "/archdiocese/deanery", // group toggle key only - never itself a page
        label: "Deanery",
        icon: <IconFolder />,
        children: [
          { href: "/archdiocese/deaneries", label: "Deaneries", icon: <IconGrid /> },
          { href: "/archdiocese/deanery-admins", label: "Deanery admins", icon: <IconUserPlus /> },
        ],
      },
      {
        href: "/archdiocese/parish", // group toggle key only - never itself a page
        label: "Parish",
        icon: <IconFolder />,
        children: [
          { href: "/archdiocese/parishes", label: "Parishes", icon: <IconGrid /> },
          { href: "/archdiocese/parish-admins", label: "Parish admins", icon: <IconUserPlus /> },
        ],
      },
      {
        href: "/archdiocese/courses", // group toggle key only - never itself a page
        label: "Courses",
        icon: <IconTree />,
        children: [
          { href: "/archdiocese/courses", label: "Courses", icon: <IconGrid /> },
          { href: "/archdiocese/modules", label: "Modules", icon: <IconBars /> },
          { href: "/archdiocese/topics", label: "Topics", icon: <IconDoc /> },
          { href: "/archdiocese/materials", label: "Materials", icon: <IconFolder /> },
          { href: "/archdiocese/exercises", label: "Exercises", icon: <IconCheckSquare /> },
        ],
      },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/archdiocese/content", label: "Content studio", icon: <IconFolder /> },
      { href: "/archdiocese/exams", label: "Exam scheduler", icon: <IconCalendar /> },
    ],
  },
  {
    label: "People",
    items: [{ href: "/archdiocese/admins", label: "Admins", icon: <IconUserPlus /> }],
  },
];
