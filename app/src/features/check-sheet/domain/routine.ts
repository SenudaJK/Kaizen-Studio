import type { FlowStepDto } from "../types";

export interface RoutineProgress {
  doneCount: number;
  total: number;
  /** The first step not yet done: what to do next. */
  nextStep: FlowStepDto | null;
  totalMinutes: number;
  remainingMinutes: number;
  isComplete: boolean;
}

export function routineProgress(steps: readonly FlowStepDto[]): RoutineProgress {
  const doneCount = steps.filter((s) => s.doneToday).length;
  const totalMinutes = steps.reduce((sum, s) => sum + s.durationMin, 0);
  const doneMinutes = steps.filter((s) => s.doneToday).reduce((sum, s) => sum + s.durationMin, 0);
  return {
    doneCount,
    total: steps.length,
    nextStep: steps.find((s) => !s.doneToday) ?? null,
    totalMinutes,
    remainingMinutes: totalMinutes - doneMinutes,
    isComplete: steps.length > 0 && doneCount === steps.length,
  };
}

/** "5m", "90m" → "1h 30m" once it passes an hour. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
