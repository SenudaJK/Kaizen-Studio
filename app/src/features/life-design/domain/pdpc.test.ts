import { describe, expect, it } from "vitest";
import { coverage, planCoverage } from "./pdpc";

describe("pdpc coverage", () => {
  it("is zero, not NaN, when no risks are named", () => {
    expect(coverage([])).toEqual({ total: 0, covered: 0, exposed: 0, percent: 0 });
  });

  it("counts active countermeasures as covered and the rest as exposed", () => {
    expect(coverage([{ active: true }, { active: false }, { active: true }])).toEqual({
      total: 3,
      covered: 2,
      exposed: 1,
      percent: 67,
    });
  });

  it("aggregates across pillars", () => {
    const result = planCoverage([{ scenarios: [{ active: true }] }, { scenarios: [{ active: false }] }, { scenarios: [] }]);
    expect(result).toMatchObject({ total: 2, covered: 1, percent: 50 });
  });
});
