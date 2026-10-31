import type { FlowStepKind } from "../types";

export interface StepKindMeta {
  /** What the user sees. */
  label: string;
  /** The quality-engineering name, shown as a hint. */
  lssTerm: string;
  description: string;
}

export const STEP_KINDS: Record<FlowStepKind, StepKindMeta> = {
  INPUT: { label: "Prepare", lssTerm: "Input", description: "Fuel up or set up before the main action." },
  PROCESS: { label: "Action", lssTerm: "Process", description: "A regular step of the routine." },
  GATE: { label: "Checkpoint", lssTerm: "Gate", description: "A rule to pass before moving on, like 'no phone yet'." },
  OUTPUT: { label: "Plan", lssTerm: "Output", description: "A step that produces something, like today's top 3 tasks." },
  CORE_CTQ: { label: "Key step", lssTerm: "Core CTQ", description: "The step that matters most. If only one thing happens, it's this." },
  AUDIT: { label: "Review", lssTerm: "Audit", description: "Look back and record how the day went." },
  POKA_YOKE: { label: "Safeguard", lssTerm: "Poka-Yoke", description: "A small setup that makes slipping up harder." },
  WIND_DOWN: { label: "Wind down", lssTerm: "Wind-down", description: "A calming step that closes the day." },
};

/** Order shown in the "add a step" picker. */
export const STEP_KIND_ORDER: readonly FlowStepKind[] = [
  "INPUT",
  "PROCESS",
  "GATE",
  "OUTPUT",
  "CORE_CTQ",
  "AUDIT",
  "POKA_YOKE",
  "WIND_DOWN",
];
