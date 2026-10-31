import { z } from "zod";

const id = z.string().min(1).max(64);

const category = z.enum(["ENVIRONMENT", "ENERGY", "ROUTINE", "MINDSET"]);

export const createProblemSchema = z.object({
  title: z.string().trim().min(1, "Describe the slip you want to dig into.").max(80, "Keep it under 80 characters."),
});

export const diagnoseBlockerSchema = z.object({ triggerId: id });

export const deleteProblemSchema = z.object({ problemId: id });

export const addCauseSchema = z.object({
  problemId: id,
  category,
  text: z.string().trim().min(1, "Describe the cause.").max(120, "Keep the cause under 120 characters."),
  fix: z.string().trim().min(1, "Add a countermeasure that removes this cause.").max(200, "Keep the countermeasure under 200 characters."),
});

export const removeCauseSchema = z.object({ causeId: id });

export const setPrimaryCauseSchema = z.object({ causeId: id });
