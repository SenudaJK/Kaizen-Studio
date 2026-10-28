# Kaizen Studio

## What this is

Kaizen Studio ("DMAIC Life OS") is a personal habit tracker that applies **Lean Six Sigma
quality tools** to personal habits instead of productivity-guru advice. Habits are treated as
processes: you measure them, find root causes of "defects" (missed habits), and design
proactive countermeasures — the same way a quality engineer would debug a factory line.

The product is built around two toolsets from Six Sigma:

- **The Basic 7 (Analytical — after numerical data):** Flow Chart, Check Sheet, Pareto Diagram,
  Fishbone (Ishikawa) Diagram, Control Chart (SPC), Scatter Diagram. Used to standardize
  routines, tally friction/slips, and find the root cause of recurring failures.
- **The New 7 (Proactive — before execution):** Process Decision Program Chart (PDPC) and
  Arrow Diagram (critical path). Used to pre-mortem a goal and plan countermeasures before
  starting it.

Current build: `kaizen_personal_life_solution_studio.html` — a single-file static HTML +
Tailwind (CDN) + vanilla JS prototype with four workspaces. It is a **visual/interaction
prototype only**: all data lives in one in-memory JS `state` object, is hardcoded, and is lost
on refresh. No backend, no persistence, no accounts.

## Where this is going

**Goal: turn this into a sellable SaaS product**, not just a personal tool. Target stack:

- **Next.js (App Router) + TypeScript** — frontend and backend in one codebase
- **Postgres** (Supabase or Neon) as the database
- **Prisma** (or Drizzle) as the ORM
- **Auth** via NextAuth/Auth.js or Clerk — every data model is scoped to a `userId`
- **Deployment** target: Vercel

Multi-tenancy matters from day one: design every table and query as if multiple paying users
exist, even while testing solo. Don't build single-user shortcuts (e.g. global singletons,
unscoped queries) that would need ripping out later.

### MVP scope (first milestone)

Port all four existing workspaces to the new stack with real persistence, scoped per user:

1. **Daily Check Sheet & Flow** — morning/evening flow-chart routines, weekly habit check
   sheet, friction/blocker tally counter
2. **Root-Cause Studio** — Pareto 80/20 chart (driven by live friction tallies), interactive
   Fishbone diagram with per-problem root causes and countermeasures
3. **Stability & Correlations** — SPC/control charts (UCL/LCL, mean, spec limits) per metric,
   scatter diagrams for correlation exploration
4. **Life Design & Pre-Mortem** — PDPC pre-mortem tree (pillars → risks → countermeasures),
   Arrow diagram critical-path network for multi-week goals

Plus the baseline SaaS scaffolding: sign up / log in, per-user data isolation, and a working
Postgres schema replacing the hardcoded `state` object below.

Not in MVP (later phases): billing/subscriptions, team/shared accounts, mobile app, notifications,
data export, AI-assisted root-cause suggestions.

## Roadmap / Phases

Build and ship in this order. Check a phase off only once its acceptance criteria are actually
verified (build passes, flows tested), not just coded.

- [x] **Phase 1 — Foundation.** Next.js (App Router, TypeScript, Tailwind) scaffolded in `app/`,
  local Postgres via `docker-compose.yml`, Prisma schema modeling all four workspaces (see Domain
  model below), initial migration applied, git repo initialized.
- [x] **Phase 2 — Auth.** Auth.js (NextAuth v5) with Prisma adapter: email/password (bcrypt) +
  Google OAuth, all routes gated behind login via `proxy.ts`, every table scoped to `userId`.
- [x] **Phase 2.5 — Design system.** Prototype's palette/fonts/icons wired into Tailwind v4
  (`globals.css`), shared auth UI primitives (`auth-card.tsx`), conventions documented above.
- [ ] **Phase 3 — Workspace 1: Daily Check Sheet & Flow.** Morning/evening flow-chart routines,
  weekly habit check sheet (real dates, not a fixed array), friction/blocker tally counter —
  all reading/writing Postgres via Prisma, scoped to the signed-in user. This becomes the app's
  main authenticated shell/nav (the four-workspace layout from the prototype).
- [ ] **Phase 4 — Workspace 2: Root-Cause Studio.** Pareto 80/20 chart computed live from
  `FrictionTally` rows, interactive Fishbone diagram (per-problem causes across the 4 fixed
  categories, primary-cause selection, Poka-Yoke countermeasure).
- [ ] **Phase 5 — Workspace 3: Stability & Correlations.** SPC/control charts with UCL/LCL/mean
  computed from `SpcDataPoint` history (not hardcoded), spec-limit slider, scatter diagrams
  pairing two metrics with correlation coefficient.
- [ ] **Phase 6 — Workspace 4: Life Design & Pre-Mortem.** PDPC pre-mortem tree (pillars → risks
  → countermeasures), Arrow diagram critical-path network with slack vs. critical-path nodes.
- [ ] **Phase 7 — Account & settings.** Profile/password change, delete-account flow, basic
  empty states and onboarding for a brand-new user (seed nothing — the prototype's demo data was
  for the mockup only; real users start from zero).
- [ ] **Phase 8 — Billing.** Stripe subscription (e.g. a single paid plan or free-trial + paid),
  webhook handling, gating workspaces behind an active subscription, customer portal for
  cancel/upgrade.
- [ ] **Phase 9 — Production readiness.** Managed Postgres (Supabase/Neon), environment configs
  for staging/prod, error monitoring (e.g. Sentry), basic analytics, responsive/mobile pass on
  all four workspaces (the prototype already has a mobile bottom-nav pattern to port), accessible
  color contrast and keyboard nav check.
- [ ] **Phase 10 — Launch.** Marketing/landing page (separate from the authenticated app), deploy
  to Vercel on a real domain, final QA pass across the full signup → use → subscribe flow.

Not planned unless requested later: team/shared accounts, native mobile app, AI-assisted
root-cause suggestions, data export/import, notifications.

## Domain model (from the prototype's `state` object)

Use this as the basis for the Postgres schema — every top-level key becomes a user-scoped table:

| Prototype state key | Becomes | Notes |
|---|---|---|
| `flowRoutines.{morning,evening}` | `FlowRoutine` + `FlowStep` | steps have order, duration, type (Input/Process/Gate/Output/Core CTQ), done flag |
| `habits` + per-day `days[]` array | `Habit` + `HabitLog` (one row per habit per date) | value is done(1) / slip(0) / pending(-1); don't keep a fixed Mon–Sun array, use real dates |
| `frictionTriggers` | `FrictionTrigger` + `FrictionTally` (one row per logged slip, with timestamp) | weekly/monthly counts should be *derived* via query, not stored counters |
| `fishboneData.{problem}.{category}[]` | `FishboneProblem` + `FishboneCause` | 4 fixed categories: environment, energy, routine, mindset; one cause can be marked `active`/primary |
| `spcMetrics.{metric}.data[]` | `SpcMetric` + `SpcDataPoint` | UCL/LCL/mean should be *computed* from recent data points, not hardcoded; spec limit + direction (min/max) stored on the metric |
| `pdpcPillars[].Scenarios[]` | `PdpcPillar` + `PdpcScenario` | risk + countermeasure + active flag |
| `arrowNodes` | `ArrowNode` | code, title, duration, path type (Critical Path / Parallel Slack), done flag |

Keep the Lean Six Sigma terminology in the UI and code (CTQ, Poka-Yoke, Takt time, Vital Few,
Special Cause, Rolled Throughput Yield, etc.) — it's the product's identity, not jargon to strip
out.

## Conventions

- TypeScript strict mode everywhere; no `any` in new code.
- Server-side data access always filtered by the authenticated `userId` — never trust a client-
  supplied user/owner id.
- SPC control limits (UCL/LCL) and Pareto cumulative percentages are *derived values* — compute
  them from raw logged data, don't store them as mutable fields that can drift out of sync.
- Prefer colocating Prisma schema changes with a migration in the same change.

## UI/UX: follow the prototype's design system exactly

`kaizen_personal_life_solution_studio.html` is the canonical visual reference. Every new page or
component in `app/` must match it — don't invent new colors, type scales, spacing, or component
shapes. If a pattern isn't covered below, open the HTML file and copy the closest existing pattern
rather than improvising.

- **Design tokens** live in `app/src/app/globals.css` under `@theme inline` (colors: `paper`,
  `ivory`, `stone`, `stoneDark`, `espresso`, `slateWarm`, `terracotta` (+`terracottaLight`),
  `sage` (+`sageLight`), `ochre` (+`ochreLight`); shadows: `shadow-editorial`, `shadow-floating`).
  Use these Tailwind utility classes (`bg-terracotta`, `text-slateWarm`, `shadow-floating`, etc.),
  never raw hex values in components.
- **Fonts**: `font-serif` (Instrument Serif) for headings/titles only, `font-sans` (Plus Jakarta
  Sans, the default body font) for everything else, `font-mono` (JetBrains Mono) for labels,
  badges, KPI numbers, eyebrows, and anything data/stat-like. Loaded via `next/font/google` in
  `app/src/app/layout.tsx` — don't add a `<link>` tag for fonts.
- **Icons**: `@phosphor-icons/react`, imported from the `dist/csr/<IconName>` subpath per icon
  (e.g. `import { CheckSquareOffsetIcon } from "@phosphor-icons/react/dist/csr/CheckSquareOffset"`)
  to avoid bundling the whole icon set. Exports are named `<IconName>Icon`.
- **Core component shapes**, matched to the prototype's HTML/Tailwind classes:
  - Cards: `bg-ivory rounded-2xl editorial-border shadow-editorial p-6` (use `shadow-floating`
    instead of `shadow-editorial` for modals/popovers).
  - Eyebrow label above a heading: `font-mono text-[11px] uppercase tracking-widest text-terracotta`
    (or `text-sage` / `text-slateWarm` depending on context).
  - Section heading: `font-serif text-2xl text-espresso` (page-level titles go up to
    `text-4xl lg:text-5xl`).
  - Body copy: `text-slateWarm text-sm`.
  - Primary button: `bg-terracotta text-ivory hover:bg-terracotta/90 rounded-xl text-sm font-medium
    px-4 py-2.5 shadow-sm transition` (use `bg-espresso`/`bg-sage` instead of `bg-terracotta` for
    non-destructive secondary actions, matching the prototype's per-tool accent color).
  - Secondary/outline button: `bg-ivory hover:bg-stone border border-stoneDark text-espresso
    rounded-xl text-sm font-medium px-4 py-2.5 transition`.
  - Inputs: `bg-stone/70 border border-stoneDark rounded-xl px-3.5 py-2.5 text-sm text-espresso
    placeholder:text-slateWarm focus:outline-none focus:border-terracotta transition`.
  - Pills/tabs (segmented control): `inline-flex bg-stone p-1 rounded-xl border border-stoneDark`
    wrapping buttons that get `bg-ivory text-espresso shadow-sm` when active, `text-slateWarm
    hover:text-espresso` when inactive.
  - Status colors: sage = success/done/positive correlation, terracotta = defect/slip/friction,
    ochre = spec limit/warning/attention.
- **Page chrome**: body keeps the warm paper background with the subtle dot grid (already set
  globally in `globals.css` — don't override it per-page). Auth pages, modals, and the future
  app shell should sit as an `ivory` card floating on that paper background, not as a plain white
  page.
- Shared auth-page primitives already exist in `app/src/components/auth-card.tsx`
  (`AuthCard`, `AuthInput`, `AuthPrimaryButton`, `AuthSecondaryButton`, `AuthDivider`) — reuse or
  extend this pattern (e.g. a `Card`, `Button` set) as the app grows, instead of re-deriving
  Tailwind classes inline on every page.
