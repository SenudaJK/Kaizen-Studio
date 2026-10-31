// Type-only re-export: the Prisma schema is the single source of truth, nothing reaches the browser bundle.
export type { FishboneCategory } from "@prisma/client";

export interface FishboneCauseDto {
  id: string;
  category: import("@prisma/client").FishboneCategory;
  text: string;
  /** The Poka-Yoke countermeasure that removes this cause. */
  fix: string;
  isPrimary: boolean;
}

export interface FishboneProblemDto {
  id: string;
  key: string;
  title: string;
  causes: FishboneCauseDto[];
}

/** A blocker with its tally count inside the chosen Pareto window. */
export interface ParetoTriggerDto {
  id: string;
  name: string;
  count: number;
  /** Fishbone problem this blocker is already being diagnosed in, if any. */
  problemKey: string | null;
}
