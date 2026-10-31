import type { IsoDate } from "@/lib/dates";

export type { SpecDirection } from "@prisma/client";

export interface SpcReadingDto {
  id: string;
  date: IsoDate;
  value: number;
  note: string | null;
}

export interface SpcMetricDto {
  id: string;
  key: string;
  name: string;
  unit: string;
  specLimit: number;
  specDirection: import("@prisma/client").SpecDirection;
  /** Oldest first. Limits are computed from these in `domain/`, never stored. */
  readings: SpcReadingDto[];
}
