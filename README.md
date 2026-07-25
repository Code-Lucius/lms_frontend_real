# Archdiocese LMS — Frontend

A Next.js 14 (App Router) + TypeScript frontend for the Archdiocese Learning Management System. It ports the design prototype into a real, componentised project covering all five roles: Parishioner, Parish Admin, Deanery Admin, Region Admin, and Archdiocese Admin.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to the St. Peter parish login (`/stpeter/login`).

```bash
npm run build && npm start   # production build
```

Requires Node 18.17+ (works on Node 20/22).

## Getting around

A slim **demo navigator** sits at the top of every page so you can jump between roles without a backend. It also has a **Subscription** toggle that flips the parish's subscription state — flip it off and the parishioner area shows the access gate, and the parish-admin banner switches to the inactive warning. This bar is scaffolding for review; delete `DemoNavigator` from `app/layout.tsx` to remove it.

Default sign-in on the parish login is prefilled (`maria.okonkwo@stpeter.org` / `passwordpassword`); any submit routes to the parishioner area since there's no auth backend yet.

## Structure

```
app/
  layout.tsx              Root layout: fonts, global CSS, providers, demo navigator
  page.tsx                Redirects to /stpeter/login
  globals.css             The full design system (tokens + components), ported verbatim
  [parish]/login          Per-parish login (multi-tenant slug, e.g. /stpeter/login)
  [parish]/set-password   Signed-link onboarding screen
  parishioner             Courses, course detail, exercises, exam centre, live exam, results, gate
  parish-admin            Parishioners, results, parish admins, subscription
  region-admin            Grading queue, grading view, analytics
  deanery-admin           Dashboard, results viewer, analytics
  archdiocese             Dashboard, hierarchy, subscriptions, directory, content studio, exam scheduler, admins
components/
  AppShell.tsx            Sidebar + topbar shell shared by every role
  DemoNavigator.tsx       Top role-switcher + subscription toggle (demo only)
  ui.tsx                  Badge, Card, StatCard, ProgressBar, Donut, Bars, SubBanner, Person
  icons.tsx               SVG icon set + the arch signature
lib/
  data.ts                 Typed mock data and helpers
  subscription.tsx        React context for the demo subscription state
```

## How the roles are organised

Each role is a single route (e.g. `/region-admin`) implemented as a client component that switches between its sub-views with local state — this mirrors the prototype's structure and keeps navigation instant. The sidebar items drive that state. When you're ready, each sub-view can be promoted to its own nested route (e.g. `/region-admin/analytics`) with minimal change, since the views are already separate components.

## Wiring the backend

All screen data comes from `lib/data.ts`. Replace those exports with calls to the Laravel REST API:

- Swap the mock arrays for `fetch`/server-component data loading or a data layer (React Query, SWR, etc.).
- The subscription gate currently reads the demo context; point it at the parish's real subscription status from the API.
- The exam window state (open / pending / closed) and the live timer are driven client-side for the demo — the real time-gating is enforced by the backend, which should reject attempts outside the window. The `schedule-exam-window` controls in the Archdiocese exam scheduler are marked PLANNED to match the PRD.

## Design system

Fonts are Fraunces (display) and Inter (body), loaded via `<link>` in `app/layout.tsx`. Colour tokens, spacing, and component styles live as CSS variables and classes in `app/globals.css`. Keyboard focus rings and reduced-motion are respected.
