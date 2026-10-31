import { z } from "zod";
import { isIsoDate } from "@/lib/dates";

const id = z.string().min(1).max(64);

const finite = (message: string) => z.coerce.number({ error: message }).refine(Number.isFinite, message);

const metricFields = {
  name: z.string().trim().min(1, "Give the metric a name.").max(40, "Keep the name under 40 characters."),
  unit: z.string().trim().max(12, "Keep the unit short, like “hrs”.").default(""),
  specLimit: finite("Enter your target as a number."),
  specDirection: z.enum(["MIN", "MAX"]),
};

export const createMetricSchema = z.object(metricFields);

export const createMetricsSchema = z.object({ metrics: z.array(z.object(metricFields)).min(1).max(10) });

export const deleteMetricSchema = z.object({ metricId: id });

export const setSpecLimitSchema = z.object({ metricId: id, specLimit: finite("Enter your target as a number.") });

export const logReadingSchema = z.object({
  metricId: id,
  /** Optional: defaults to the user's today. Never a future day. */
  date: z
    .string()
    .refine(isIsoDate, "Pick a valid date.")
    .optional(),
  value: finite("Enter the reading as a number."),
  note: z
    .string()
    .trim()
    .max(80, "Keep the note under 80 characters.")
    .transform((note) => (note === "" ? null : note))
    .optional(),
});

export const deleteReadingSchema = z.object({ readingId: id });
