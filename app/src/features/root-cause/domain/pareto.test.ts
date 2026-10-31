import { describe, expect, it } from "vitest";
import type { IsoDate } from "@/lib/dates";
import { buildPareto, resolveWindow, windowRange } from "./pareto";

const item = (id: string, count: number, name = id) => ({ id, name, count });

describe("buildPareto", () => {
  it("returns an empty chart when nothing was tallied", () => {
    expect(buildPareto([])).toEqual({ bars: [], total: 0, vitalCount: 0, vitalPct: 0 });
    expect(buildPareto([item("a", 0)]).bars).toEqual([]);
  });

  it("ranks by count, then name, and drops zero-count blockers", () => {
    const { bars } = buildPareto([item("b", 2, "Bravo"), item("z", 0), item("a", 2, "Alpha"), item("c", 5, "Charlie")]);
    expect(bars.map((b) => b.id)).toEqual(["c", "a", "b"]);
  });

  it("computes cumulative percentages from the raw counts", () => {
    const { bars, total } = buildPareto([item("a", 8), item("b", 5), item("c", 3), item("d", 2), item("e", 2)]);
    expect(total).toBe(20);
    expect(bars.map((b) => Math.round(b.cumulativePct))).toEqual([40, 65, 80, 90, 100]);
  });

  it("marks every bar that starts below 80% as Vital, including the one that crosses the line", () => {
    const { bars, vitalCount, vitalPct } = buildPareto([item("a", 8), item("b", 5), item("c", 3), item("d", 2), item("e", 2)]);
    // 40% and 65% start below 80%; the third bar starts at 65% and lands exactly on 80%.
    expect(bars.map((b) => b.isVital)).toEqual([true, true, true, false, false]);
    expect(vitalCount).toBe(3);
    expect(vitalPct).toBe(80);
  });

  it("treats a single dominant blocker as the whole Vital Few", () => {
    const result = buildPareto([item("a", 9), item("b", 1)]);
    expect(result.vitalCount).toBe(1);
    expect(result.vitalPct).toBe(90);
  });

  it("ends the cumulative curve at exactly 100%", () => {
    const { bars } = buildPareto([item("a", 3), item("b", 3), item("c", 1)]);
    expect(bars.at(-1)?.cumulativePct).toBeCloseTo(100, 10);
  });
});

describe("windows", () => {
  it("defaults to the week and only accepts 'month' as an alternative", () => {
    expect(resolveWindow(undefined)).toBe("week");
    expect(resolveWindow("nonsense")).toBe("week");
    expect(resolveWindow(["month"])).toBe("week");
    expect(resolveWindow("month")).toBe("month");
  });

  it("covers Monday through today for the week, and 30 days for the month", () => {
    const wednesday = "2026-10-28" as IsoDate;
    expect(windowRange("week", wednesday)).toEqual({ from: "2026-10-26", to: wednesday });
    expect(windowRange("month", wednesday)).toEqual({ from: "2026-09-29", to: wednesday });
  });
});
