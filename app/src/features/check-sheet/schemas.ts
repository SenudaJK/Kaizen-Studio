import { z } from "zod";
import { isIsoDate, type IsoDate } from "@/lib/dates";

const id = z.string().min(1).max(64);
const isoDate = z.string().refine(isIsoDate, "That date isn't valid.").transform((s) => s as IsoDate);
const name = (label: string) =>
  z.string().trim().min(1, `Give your ${label} a name.`).max(80, "Keep it under 80 characters.");

const routineType = z.enum(["MORNING", "EVENING"]);
const stepKind = z.enum(["INPUT", "PROCESS", "GATE", "OUTPUT", "CORE_CTQ", "AUDIT", "POKA_YOKE", "WIND_DOWN"]);

export const setHabitStatusSchema = z.object({
  habitId: id,
  date: isoDate,
  status: z.enum(["DONE", "SLIP", "PENDING"]),
});

export const addHabitSchema = z.object({
  name: name("habit"),
  target: z.string().trim().max(40, "Keep the standard under 40 characters.").default(""),
});

export const archiveHabitSchema = z.object({ habitId: id });

export const toggleFlowStepSchema = z.object({ stepId: id, done: z.boolean() });

export const addFlowStepSchema = z.object({
  routine: routineType,
  name: name("step"),
  durationMin: z.coerce.number().int("Use whole minutes.").min(1, "At least 1 minute.").max(720, "That's over 12 hours."),
  kind: stepKind,
});

export const removeFlowStepSchema = z.object({ stepId: id });

export const applyStarterRoutineSchema = z.object({ routine: routineType });

export const logFrictionSchema = z.object({ triggerId: id });

export const undoFrictionSchema = z.object({ triggerId: id });

export const addFrictionTriggerSchema = z.object({
  name: name("blocker"),
  /** Also record one occurrence right away (used by the quick-add flow). */
  logNow: z.boolean().default(false),
});
