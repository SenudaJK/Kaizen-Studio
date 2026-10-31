import { describe, expect, it } from "vitest";
import { formatDays, nextMilestone, nextNodeCode, summarizeNetwork } from "./arrow";

const node = (durationDays: number, path: "CRITICAL_PATH" | "PARALLEL_SLACK", done: boolean) => ({ durationDays, path, done });

describe("summarizeNetwork", () => {
  it("is all zeros for an empty network", () => {
    expect(summarizeNetwork([])).toEqual({ nodeCount: 0, doneCount: 0, criticalDays: 0, criticalDaysLeft: 0, slackDays: 0, percentDone: 0 });
  });

  it("matches the prototype's half-marathon plan: 42 critical days, 3 of 6 nodes done", () => {
    const nodes = [
      node(4, "CRITICAL_PATH", true),
      node(10, "CRITICAL_PATH", true),
      node(7, "PARALLEL_SLACK", true),
      node(14, "CRITICAL_PATH", false),
      node(7, "CRITICAL_PATH", false),
      node(7, "CRITICAL_PATH", false),
    ];
    expect(summarizeNetwork(nodes)).toEqual({
      nodeCount: 6,
      doneCount: 3,
      criticalDays: 42,
      criticalDaysLeft: 28,
      slackDays: 7,
      percentDone: 33,
    });
  });

  it("ignores slack work when measuring progress along the critical path", () => {
    expect(summarizeNetwork([node(5, "PARALLEL_SLACK", true), node(5, "CRITICAL_PATH", false)]).percentDone).toBe(0);
  });
});

describe("nextMilestone", () => {
  it("is the first unfinished critical node, skipping slack and done work", () => {
    const nodes = [node(1, "CRITICAL_PATH", true), node(2, "PARALLEL_SLACK", false), node(3, "CRITICAL_PATH", false)];
    expect(nextMilestone(nodes)).toBe(nodes[2]);
  });

  it("is null when the critical path is finished", () => {
    expect(nextMilestone([node(1, "CRITICAL_PATH", true)])).toBeNull();
  });
});

describe("helpers", () => {
  it("pluralizes days", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(14)).toBe("14 days");
  });

  it("numbers nodes in steps of ten", () => {
    expect(nextNodeCode(0)).toEqual({ order: 1, code: "10" });
    expect(nextNodeCode(5)).toEqual({ order: 6, code: "60" });
  });
});
