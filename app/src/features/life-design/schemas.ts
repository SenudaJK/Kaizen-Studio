import { z } from "zod";

const id = z.string().min(1).max(64);

const goal = z.string().trim().max(120, "Keep it under 120 characters.");

export const setObjectiveSchema = z.object({ objective: goal });
export const setArrowGoalSchema = z.object({ goal });

export const addPillarSchema = z.object({
  title: z.string().trim().min(1, "Name the habit or routine this pillar protects.").max(80, "Keep the name under 80 characters."),
  subtitle: z.string().trim().max(100, "Keep the detail under 100 characters.").default(""),
});
export const deletePillarSchema = z.object({ pillarId: id });

export const addScenarioSchema = z.object({
  pillarId: id,
  risk: z.string().trim().min(1, "Describe what could go wrong.").max(140, "Keep the risk under 140 characters."),
  counter: z.string().trim().min(1, "Add the backup move for this risk.").max(200, "Keep the countermeasure under 200 characters."),
});
export const scenarioIdSchema = z.object({ scenarioId: id });

export const addNodeSchema = z.object({
  title: z.string().trim().min(1, "Name the milestone.").max(80, "Keep the name under 80 characters."),
  durationDays: z.coerce.number().int("Use whole days.").min(1, "A milestone takes at least 1 day.").max(365, "Keep it to a year or less."),
  path: z.enum(["CRITICAL_PATH", "PARALLEL_SLACK"]),
});
export const nodeIdSchema = z.object({ nodeId: id });
export const setNodePathSchema = z.object({ nodeId: id, path: z.enum(["CRITICAL_PATH", "PARALLEL_SLACK"]) });
