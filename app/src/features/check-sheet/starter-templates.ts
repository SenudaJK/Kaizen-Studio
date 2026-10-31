import type { FlowRoutineType, FlowStepKind } from "./types";

/**
 * Optional one-click suggestions for an empty routine. Nothing is seeded automatically;
 * a user opts in, then edits freely.
 */
export interface StarterStep {
  name: string;
  durationMin: number;
  kind: FlowStepKind;
}

export const STARTER_ROUTINES: Record<FlowRoutineType, StarterStep[]> = {
  MORNING: [
    { name: "Hydrate + minerals", durationMin: 5, kind: "INPUT" },
    { name: "Outdoor sunlight walk", durationMin: 15, kind: "PROCESS" },
    { name: "Mobility or light workout", durationMin: 20, kind: "PROCESS" },
    { name: "Coffee, phone-free", durationMin: 10, kind: "GATE" },
    { name: "Write today's top 3", durationMin: 5, kind: "OUTPUT" },
    { name: "90 minutes of deep work", durationMin: 90, kind: "CORE_CTQ" },
  ],
  EVENING: [
    { name: "Log today's check sheet", durationMin: 5, kind: "AUDIT" },
    { name: "Kitchen reset + prep tomorrow", durationMin: 15, kind: "POKA_YOKE" },
    { name: "Dock phone outside the bedroom", durationMin: 2, kind: "GATE" },
    { name: "Warm shower, dim lights", durationMin: 10, kind: "PROCESS" },
    { name: "Read something on paper", durationMin: 15, kind: "WIND_DOWN" },
    { name: "Lights out", durationMin: 480, kind: "CORE_CTQ" },
  ],
};

export const ROUTINE_LABELS: Record<FlowRoutineType, { title: string; short: string }> = {
  MORNING: { title: "Morning launch", short: "Morning" },
  EVENING: { title: "Evening shutdown", short: "Evening" },
};

/** Common habit blockers a new user can add with one tap. */
export const SUGGESTED_TRIGGERS: readonly string[] = [
  "Late-night scrolling",
  "Skipped a meal",
  "Poor sleep the night before",
  "Unplanned meetings or messages",
  "Low energy after lunch",
];
