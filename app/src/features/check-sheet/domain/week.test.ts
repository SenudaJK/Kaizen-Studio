import { describe, expect, it } from "vitest";
import { resolveWeekStart } from "./week";

describe("resolveWeekStart", () => {
  const today = "2026-10-29"; // Thursday; its week starts 2026-10-26

  it("defaults to the current week", () => {
    expect(resolveWeekStart(undefined, today)).toBe("2026-10-26");
  });
  it("snaps any day in a past week to that week's Monday", () => {
    expect(resolveWeekStart("2026-10-14", today)).toBe("2026-10-12");
  });
  it("never goes into the future", () => {
    expect(resolveWeekStart("2026-12-01", today)).toBe("2026-10-26");
  });
  it("ignores garbage", () => {
    expect(resolveWeekStart("not-a-date", today)).toBe("2026-10-26");
    expect(resolveWeekStart(["2026-10-14", "x"], today)).toBe("2026-10-12");
  });
});
