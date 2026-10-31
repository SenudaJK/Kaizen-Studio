import { describe, expect, it } from "vitest";
import type { IsoDate } from "@/lib/dates";
import { describeCorrelation, directionOf, formatR, linearFit, pairByDate, strengthOf, type Pair } from "./correlation";

const pairs = (points: Array<[number, number]>): Pair[] => points.map(([x, y], i) => ({ date: `2026-10-${String(i + 1).padStart(2, "0")}` as IsoDate, x, y }));

describe("pairByDate", () => {
  it("keeps only days both metrics were logged, oldest first", () => {
    const day = (d: string) => `2026-10-${d}` as IsoDate;
    const xs = [{ date: day("03"), value: 7 }, { date: day("01"), value: 6 }, { date: day("02"), value: 8 }];
    const ys = [{ date: day("01"), value: 60 }, { date: day("03"), value: 90 }, { date: day("09"), value: 10 }];
    expect(pairByDate(xs, ys)).toEqual([
      { date: "2026-10-01", x: 6, y: 60 },
      { date: "2026-10-03", x: 7, y: 90 },
    ]);
  });
});

describe("linearFit", () => {
  it("returns null with fewer than five pairs", () => {
    expect(linearFit(pairs([[1, 1], [2, 2], [3, 3], [4, 4]]))).toBeNull();
  });

  it("finds a perfect positive line", () => {
    const fit = linearFit(pairs([[1, 3], [2, 5], [3, 7], [4, 9], [5, 11]]));
    expect(fit?.r).toBeCloseTo(1);
    expect(fit?.slope).toBeCloseTo(2);
    expect(fit?.intercept).toBeCloseTo(1);
    expect(fit?.rSquared).toBeCloseTo(1);
  });

  it("finds a negative relationship", () => {
    const fit = linearFit(pairs([[0, 8], [50, 7], [100, 6], [150, 5], [200, 4]]));
    expect(fit?.r).toBeCloseTo(-1);
    expect(fit?.slope).toBeCloseTo(-0.02);
  });

  it("returns null when one metric never changes (r is undefined)", () => {
    expect(linearFit(pairs([[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]]))).toBeNull();
  });
});

describe("labels", () => {
  it("buckets strength by |r|", () => {
    expect([0.9, -0.75, 0.5, 0.25, 0.1].map(strengthOf)).toEqual(["strong", "strong", "moderate", "weak", "none"]);
  });

  it("reports direction and a signed r", () => {
    expect(directionOf(-0.3)).toBe("negative");
    expect(formatR(0.862)).toBe("+0.86");
    expect(formatR(-0.5)).toBe("−0.50");
  });
});

describe("describeCorrelation", () => {
  const base = { xName: "Sleep", yName: "Deep focus", xUnit: "hr", yUnit: "min" };
  const fit = (r: number, slope: number) => ({ n: 10, r, rSquared: r * r, slope, intercept: 0 });

  it("says there is no link when r is near zero", () => {
    expect(describeCorrelation({ ...base, fit: fit(0.05, 0.1) }).title).toMatch(/No clear link/);
  });

  it("describes direction and slope, and never claims causation", () => {
    const text = describeCorrelation({ ...base, fit: fit(0.86, 24) });
    expect(text.title).toBe("When Sleep rises, Deep focus tends to go up.");
    expect(text.detail).toContain("about 24 min more Deep focus");
    expect(text.detail).toMatch(/not proof/);
  });

  it("flags a weak pattern as faint", () => {
    expect(describeCorrelation({ ...base, fit: fit(-0.3, -2) }).title).toMatch(/^A faint pattern/);
  });
});
