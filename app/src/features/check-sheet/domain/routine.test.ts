import { describe, expect, it } from "vitest";
import type { FlowStepDto } from "../types";
import { formatMinutes, routineProgress } from "./routine";

const step = (id: string, durationMin: number, doneToday: boolean): FlowStepDto => ({
  id,
  name: id,
  durationMin,
  kind: "PROCESS",
  doneToday,
});

describe("routineProgress", () => {
  it("finds the next step and remaining time", () => {
    const p = routineProgress([step("a", 5, true), step("b", 15, false), step("c", 30, false)]);
    expect(p.doneCount).toBe(1);
    expect(p.nextStep?.id).toBe("b");
    expect(p.totalMinutes).toBe(50);
    expect(p.remainingMinutes).toBe(45);
    expect(p.isComplete).toBe(false);
  });

  it("is complete only when there are steps and all are done", () => {
    expect(routineProgress([step("a", 5, true)]).isComplete).toBe(true);
    expect(routineProgress([]).isComplete).toBe(false);
  });
});

describe("formatMinutes", () => {
  it("switches to hours past 60 minutes", () => {
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(90)).toBe("1h 30m");
  });
});
