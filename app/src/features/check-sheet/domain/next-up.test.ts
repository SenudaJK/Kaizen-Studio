import { describe, expect, it } from "vitest";
import type { FlowRoutineDto, FlowRoutineType } from "../types";
import { describeNextUp, greetingFor, routineForHour } from "./next-up";

const routine = (type: FlowRoutineType, steps: Array<[string, boolean]>): FlowRoutineDto => ({
  type,
  steps: steps.map(([name, doneToday], i) => ({ id: String(i), name, durationMin: 10, kind: "PROCESS", doneToday })),
});
const empty = { MORNING: routine("MORNING", []), EVENING: routine("EVENING", []) };

describe("routineForHour / greetingFor", () => {
  it("switches to the evening routine at 3pm", () => {
    expect(routineForHour(14)).toBe("MORNING");
    expect(routineForHour(15)).toBe("EVENING");
  });
  it("greets by time of day", () => {
    expect(greetingFor(8)).toBe("Good morning");
    expect(greetingFor(13)).toBe("Good afternoon");
    expect(greetingFor(20)).toBe("Good evening");
  });
});

describe("describeNextUp", () => {
  it("points at the next unfinished step of the current routine", () => {
    const routines = { ...empty, MORNING: routine("MORNING", [["Hydrate", true], ["Walk", false]]) };
    expect(describeNextUp({ hour: 9, routines, habitsTotal: 3, habitsLoggedToday: 0 })).toContain("Walk");
  });

  it("falls back to habits when the routine is finished or empty", () => {
    expect(describeNextUp({ hour: 9, routines: empty, habitsTotal: 3, habitsLoggedToday: 2 })).toBe("1 habit left to check in today.");
    expect(describeNextUp({ hour: 9, routines: empty, habitsTotal: 3, habitsLoggedToday: 3 })).toContain("checked in for today");
  });

  it("invites a brand-new user to set things up", () => {
    expect(describeNextUp({ hour: 9, routines: empty, habitsTotal: 0, habitsLoggedToday: 0 })).toContain("Set up");
  });
});
