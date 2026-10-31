import { describe, expect, it } from "vitest";
import { tallyGroups } from "./tally";

describe("tallyGroups", () => {
  it("splits counts into bundles of five plus loose strokes", () => {
    expect(tallyGroups(0)).toEqual({ fullGroups: 0, remainder: 0 });
    expect(tallyGroups(4)).toEqual({ fullGroups: 0, remainder: 4 });
    expect(tallyGroups(5)).toEqual({ fullGroups: 1, remainder: 0 });
    expect(tallyGroups(13)).toEqual({ fullGroups: 2, remainder: 3 });
  });

  it("treats negative or fractional input as safe", () => {
    expect(tallyGroups(-3)).toEqual({ fullGroups: 0, remainder: 0 });
    expect(tallyGroups(6.9)).toEqual({ fullGroups: 1, remainder: 1 });
  });
});
