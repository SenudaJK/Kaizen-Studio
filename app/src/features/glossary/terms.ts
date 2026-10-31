/**
 * Plain-English definitions for the Lean Six Sigma vocabulary used across the app.
 * The product keeps the official terms (they are its identity) but never leaves a user
 * guessing: every term gets a one-line "in plain words" and a fuller explanation.
 */
export type GlossaryKey =
  | "yield"
  | "sigma"
  | "ctq"
  | "poka-yoke"
  | "flow-chart"
  | "check-sheet"
  | "defect"
  | "muda"
  | "pareto"
  | "vital-few"
  | "fishbone"
  | "spc"
  | "control-limits"
  | "special-cause"
  | "spec-limit"
  | "scatter"
  | "correlation"
  | "pdpc"
  | "arrow-diagram"
  | "critical-path"
  | "belt";

export interface GlossaryEntry {
  /** The official term. */
  term: string;
  /** One line, no jargon. Shown in hover hints. */
  plain: string;
  /** A short paragraph with an example. Shown in the guide. */
  detail: string;
  group: "measure" | "tools";
}

export const GLOSSARY: Record<GlossaryKey, GlossaryEntry> = {
  yield: {
    term: "Yield",
    plain: "Out of the days you could have done a habit, the share you actually did.",
    detail: "If you could have done a habit on 6 days and did it on 5, your yield is 83%. It is the simplest honest score for consistency.",
    group: "measure",
  },
  sigma: {
    term: "Sigma level (σ)",
    plain: "A reliability score. Higher means fewer slips. 3σ is about 93% consistent.",
    detail: "Factories use sigma to say how rarely a process fails. 2σ is roughly 69% success, 3σ is 93%, 4σ is 99.4%. For a person, 3σ is an excellent target and 4σ is world-class.",
    group: "measure",
  },
  ctq: {
    term: "CTQ (Critical to Quality)",
    plain: "The one thing that matters most in a routine.",
    detail: "Out of any set of steps, the CTQ is the step the whole result depends on. For a morning routine it might be your deep-work block. Protect it first.",
    group: "measure",
  },
  "poka-yoke": {
    term: "Poka-Yoke (mistake-proofing)",
    plain: "A small setup that makes the mistake hard to make.",
    detail: "Instead of relying on willpower, change the environment: charge your phone in the kitchen so you can't scroll in bed. Good mistake-proofing works even on bad days.",
    group: "measure",
  },
  defect: {
    term: "Defect",
    plain: "A missed habit. Not a failure, just a data point.",
    detail: "Quality engineers count defects without blame, because each one points at a flaw in the process. We borrow the same attitude: a slip tells you what to fix.",
    group: "measure",
  },
  muda: {
    term: "Muda (waste)",
    plain: "Anything that eats your time or energy without helping.",
    detail: "Muda is the Lean word for waste. In your day it's the friction that makes habits harder: clutter, distractions, decisions you shouldn't have to make.",
    group: "measure",
  },
  belt: {
    term: "Belt rank",
    plain: "Your long-term progress level, earned by checking habits off.",
    detail: "Six Sigma practitioners earn belts from White to Black. Here, every habit you complete counts toward your next belt, and it never goes down.",
    group: "measure",
  },
  "flow-chart": {
    term: "Flow Chart",
    plain: "Your routine written as clear, ordered steps.",
    detail: "Writing a routine as a sequence removes decisions. You never wonder what's next. You follow the chain and tick steps off.",
    group: "tools",
  },
  "check-sheet": {
    term: "Check Sheet",
    plain: "A simple grid where you tick off what happened each day.",
    detail: "The oldest quality tool: record facts as they happen, in one place. Over a week it shows exactly which habits hold and which wobble.",
    group: "tools",
  },
  pareto: {
    term: "Pareto chart (80/20)",
    plain: "Ranks your blockers so you fix the biggest ones first.",
    detail: "Usually a few causes create most of the problems. Counting your blockers shows which ones, and the Root-Cause Studio draws the chart for you.",
    group: "tools",
  },
  "vital-few": {
    term: "Vital Few",
    plain: "The handful of causes behind most of your slips.",
    detail: "From the 80/20 rule: fix the two or three biggest blockers and most of the trouble disappears.",
    group: "tools",
  },
  fishbone: {
    term: "Fishbone diagram",
    plain: "A map for digging into why something keeps going wrong.",
    detail: "Instead of blaming willpower, list causes under Environment, Energy, Routine and Mindset, then pick the one that matters most and design a fix for it.",
    group: "tools",
  },
  spc: {
    term: "Control chart (SPC)",
    plain: "A chart that shows normal ups and downs versus real surprises.",
    detail: "It draws the range your numbers normally stay in, so you can tell a bad day from a real change. Find it in Stability & Correlations.",
    group: "tools",
  },
  "control-limits": {
    term: "Control limits (UCL / LCL)",
    plain: "The range your numbers normally fall in, worked out from your own readings.",
    detail: "The upper and lower control limits mark how far your days usually swing. They describe what your routine does, not what you wish it did. A reading outside them is unusual enough to deserve a look.",
    group: "tools",
  },
  "special-cause": {
    term: "Special cause",
    plain: "A day that was unusual for a reason, not just random ups and downs.",
    detail: "Everyday wobble is called common cause and isn't worth chasing. A special cause is a point outside your normal range: a late flight, an illness, a deadline. Find what happened so you can prevent or repeat it.",
    group: "tools",
  },
  "spec-limit": {
    term: "Spec limit (your target)",
    plain: "The line you want to be on the right side of, like 7+ hours of sleep.",
    detail: "Your target is what you want. The control limits are what actually happens. If your normal range straddles your target, you'll miss it regularly, and the fix is to change the routine, not to try harder.",
    group: "tools",
  },
  scatter: {
    term: "Scatter diagram",
    plain: "Dots that show whether two things rise and fall together.",
    detail: "Plot one number against another, one dot per day. If the dots slope up or down, the two are linked, which points to an upstream habit worth changing.",
    group: "tools",
  },
  correlation: {
    term: "Correlation (r)",
    plain: "A score from -1 to +1 for how closely two numbers move together.",
    detail: "Near +1 means they rise together, near -1 means one rises as the other falls, near 0 means no link. A strong score is a lead to test with an experiment, not proof that one causes the other.",
    group: "tools",
  },
  pdpc: {
    term: "Pre-mortem (PDPC)",
    plain: "Plan for what could go wrong before it does.",
    detail: "List the obstacles that could derail a goal and decide your backup move for each one in advance.",
    group: "tools",
  },
  "arrow-diagram": {
    term: "Arrow diagram",
    plain: "A goal broken into ordered milestones, so you can see what depends on what.",
    detail: "Lay out the steps of a multi-week goal in sequence with a duration for each. It shows how long the whole thing takes and which steps can't be allowed to slip.",
    group: "tools",
  },
  "critical-path": {
    term: "Critical path",
    plain: "The chain of steps that sets your finish date. A delay on any of them delays the goal.",
    detail: "Some milestones can run alongside others and have slack: they can slip a few days with no effect. The critical path has none. Protect those steps first and give the rest breathing room.",
    group: "tools",
  },
};
