// Type-only re-export: the Prisma schema is the single source of truth, nothing reaches the browser bundle.
export type { ArrowPathType } from "@prisma/client";

export interface PdpcScenarioDto {
  id: string;
  /** What could go wrong. */
  risk: string;
  /** The backup move decided in advance. */
  counter: string;
  /** Whether the countermeasure is switched on as a standing plan. */
  active: boolean;
}

export interface PdpcPillarDto {
  id: string;
  title: string;
  subtitle: string;
  scenarios: PdpcScenarioDto[];
}

export interface ArrowNodeDto {
  id: string;
  code: string;
  title: string;
  durationDays: number;
  path: import("@prisma/client").ArrowPathType;
  done: boolean;
}

export interface LifeGoalDto {
  pdpcObjective: string | null;
  arrowGoal: string | null;
}
