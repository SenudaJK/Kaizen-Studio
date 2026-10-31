import { describe, expect, it } from "vitest";
import { inverseNormalCdf, sigmaFromYield, yieldForSigma } from "./sigma";

describe("sigma", () => {
  it("inverts the normal CDF at well-known points", () => {
    expect(inverseNormalCdf(0.5)).toBeCloseTo(0, 6);
    expect(inverseNormalCdf(0.8413447)).toBeCloseTo(1, 4);
    expect(inverseNormalCdf(0.9772499)).toBeCloseTo(2, 4);
    expect(inverseNormalCdf(0.0227501)).toBeCloseTo(-2, 4);
  });

  it("matches the classic sigma table (with the 1.5σ shift)", () => {
    expect(sigmaFromYield(0.6915)).toBeCloseTo(2, 2);
    expect(sigmaFromYield(0.9332)).toBeCloseTo(3, 2);
    expect(sigmaFromYield(0.99379)).toBeCloseTo(4, 2);
  });

  it("clamps to the 0–6 range", () => {
    expect(sigmaFromYield(0)).toBe(0);
    expect(sigmaFromYield(1)).toBe(6);
  });

  it("round-trips sigma → yield → sigma", () => {
    for (const sigma of [1, 2, 3, 4, 5]) {
      expect(sigmaFromYield(yieldForSigma(sigma))).toBeCloseTo(sigma, 2);
    }
  });
});
