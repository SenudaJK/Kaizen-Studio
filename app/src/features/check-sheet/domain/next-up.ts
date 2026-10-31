import { ROUTINE_LABELS } from "../starter-templates";
import type { FlowRoutineDto, FlowRoutineType } from "../types";
import { formatMinutes, routineProgress } from "./routine";

/** Before 3pm the morning routine is the one in play; after that, the evening one. */
export function routineForHour(hour: number): FlowRoutineType {
  return hour >= 15 ? "EVENING" : "MORNING";
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** The single most useful sentence to show at the top of the page. */
export function describeNextUp(input: {
  hour: number;
  routines: Record<FlowRoutineType, FlowRoutineDto>;
  habitsTotal: number;
  habitsLoggedToday: number;
}): string {
  const type = routineForHour(input.hour);
  const { nextStep } = routineProgress(input.routines[type].steps);
  if (nextStep) {
    return `Up next in your ${ROUTINE_LABELS[type].title.toLowerCase()}: ${nextStep.name} (${formatMinutes(nextStep.durationMin)}).`;
  }

  const remaining = input.habitsTotal - input.habitsLoggedToday;
  if (remaining > 0) return `${remaining} ${remaining === 1 ? "habit" : "habits"} left to check in today.`;
  if (input.habitsTotal > 0) return "Everything is checked in for today. Honest tracking is what makes this work.";
  return "Set up a routine and a habit or two to start measuring your day.";
}
