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
- Keep the existing visual language when porting UI: editorial/paper aesthetic, Instrument Serif
  for headings, Plus Jakarta Sans for body, JetBrains Mono for data/labels, Phosphor Icons,
  terracotta/sage/ochre accent palette on a warm paper background.
- Prefer colocating Prisma schema changes with a migration in the same change.
