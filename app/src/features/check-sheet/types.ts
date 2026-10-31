import type { IsoDate } from "@/lib/dates";

// Single source of truth for these enums is the Prisma schema; they are type-only
// re-exports, so nothing from @prisma/client reaches the browser bundle.
export type { FlowRoutineType, FlowStepKind } from "@prisma/client";

/** A habit is only stored as DONE or SLIP; a day with no entry is simply "not logged yet". */
export type LoggedStatus = "DONE" | "SLIP";

export interface HabitDto {
  id: string;
  name: string;
  /** The standard the habit is held to, e.g. "30 min" or "Before 11am". */
  target: string;
  /** First day this habit counts toward the weekly score. */
  startsOn: IsoDate;
  /** Logged days within the week being viewed. */
  statuses: Partial<Record<IsoDate, LoggedStatus>>;
}

export interface FlowStepDto {
  id: string;
  name: string;
  durationMin: number;
  kind: import("@prisma/client").FlowStepKind;
  doneToday: boolean;
}

export interface FlowRoutineDto {
  type: import("@prisma/client").FlowRoutineType;
  steps: FlowStepDto[];
}

export interface FrictionTriggerDto {
  id: string;
  name: string;
  weekCount: number;
}
