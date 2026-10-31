import { describe, expect, it } from "vitest";
import type { IsoDate } from "@/lib/dates";
import { currentStreak, type DayScore } from "./streak";

const scores = (entries: Array<[IsoDate, DayScore]>) => new Map(entries);
const good: DayScore = { done: 5, tracked: 6 }; // 83%
const bad: DayScore = { done: 3, tracked: 6 }; // 50%

describe("currentStreak", () => {
  it("counts consecutive qualifying days including today", () => {
    const map = scores([["2026-10-27", good], ["2026-10-28", good], ["2026-10-29", good]]);
    expect(currentStreak(map, "2026-10-29")).toBe(3);
  });

  it("keeps the streak alive while today is still pending", () => {
    const map = scores([["2026-10-27", good], ["2026-10-28", good]]);
    expect(currentStreak(map, "2026-10-29")).toBe(2);
  });

  it("stops at the first day below the threshold", () => {
    const map = scores([["2026-10-26", good], ["2026-10-27", bad], ["2026-10-28", good], ["2026-10-29", good]]);
    expect(currentStreak(map, "2026-10-29")).toBe(2);
  });

  it("is zero with no data or when yesterday was a miss", () => {
    expect(currentStreak(new Map(), "2026-10-29")).toBe(0);
    expect(currentStreak(scores([["2026-10-28", bad]]), "2026-10-29")).toBe(0);
  });
});
