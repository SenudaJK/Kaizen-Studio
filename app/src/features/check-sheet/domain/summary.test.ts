import { describe, expect, it } from "vitest";
import { buildDayScores } from "./day-scores";
import { summarizeWeek } from "./summary";
import { habitYield } from "./yield";
import type { HabitDto } from "../types";

const week = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"] as const;
const habit = (statuses: HabitDto["statuses"], startsOn: HabitDto["startsOn"] = "2026-10-26"): HabitDto => ({
  id: "h",
  name: "Walk",
  target: "",
  startsOn,
  statuses,
});

describe("habitYield", () => {
  it("counts finished days as chances, but not an unlogged today", () => {
    const h = habit({ "2026-10-26": "DONE", "2026-10-27": "DONE", "2026-10-28": "SLIP" });
    // Mon–Wed are over, Thu (today) is not logged yet → 3 chances, 2 done.
    expect(habitYield(h, [...week], "2026-10-29")).toEqual({ done: 2, opportunities: 3 });
  });

  it("counts today once it is logged", () => {
    const h = habit({ "2026-10-29": "DONE" });
    expect(habitYield(h, [...week], "2026-10-29")).toEqual({ done: 1, opportunities: 4 });
  });

  it("ignores days before the habit started", () => {
    const h = habit({ "2026-10-28": "DONE" }, "2026-10-28");
    expect(habitYield(h, [...week], "2026-10-29")).toEqual({ done: 1, opportunities: 1 });
  });
});

describe("summarizeWeek", () => {
  it("withholds sigma until there are enough chances", () => {
    const h = habit({ "2026-10-26": "DONE" });
    expect(summarizeWeek([h], [...week], "2026-10-27", []).sigma).toBeNull();
  });

  it("reports yield, sigma and blockers", () => {
    const h = habit({ "2026-10-26": "DONE", "2026-10-27": "DONE", "2026-10-28": "DONE", "2026-10-29": "DONE", "2026-10-30": "SLIP" });
    const s = summarizeWeek([h], [...week], "2026-10-31", [{ id: "t", name: "x", weekCount: 2 }]);
    expect(s.ratio).toBeCloseTo(4 / 5); // Mon–Fri are over; Saturday (today) isn't logged yet
    expect(s.sigma).not.toBeNull();
    expect(s.blockerCount).toBe(2);
  });
});

describe("buildDayScores", () => {
  it("tracks habits only from their start day", () => {
    const scores = buildDayScores(["2026-10-26", "2026-10-28"], ["2026-10-28", "2026-10-28"], "2026-10-27", "2026-10-28");
    expect(scores.get("2026-10-27")).toEqual({ done: 0, tracked: 1 });
    expect(scores.get("2026-10-28")).toEqual({ done: 2, tracked: 2 });
  });
});
