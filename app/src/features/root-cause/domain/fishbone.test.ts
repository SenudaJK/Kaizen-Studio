import { describe, expect, it } from "vitest";
import { FISHBONE_CATEGORIES, groupByCategory, primaryCause, problemKeyForTrigger } from "./fishbone";

describe("fishbone", () => {
  it("has the four fixed categories", () => {
    expect(FISHBONE_CATEGORIES.map((c) => c.key)).toEqual(["ENVIRONMENT", "ENERGY", "ROUTINE", "MINDSET"]);
  });

  it("finds the primary cause, or null when none is chosen", () => {
    expect(primaryCause([{ id: "a", isPrimary: false }, { id: "b", isPrimary: true }])).toEqual({ id: "b", isPrimary: true });
    expect(primaryCause([{ isPrimary: false }])).toBeNull();
    expect(primaryCause([])).toBeNull();
  });

  it("groups causes by bone without losing order, and always returns all four bones", () => {
    const grouped = groupByCategory([
      { id: "1", category: "ENERGY" as const },
      { id: "2", category: "ROUTINE" as const },
      { id: "3", category: "ENERGY" as const },
    ]);
    expect(grouped.ENERGY.map((c) => c.id)).toEqual(["1", "3"]);
    expect(grouped.ENVIRONMENT).toEqual([]);
    expect(grouped.MINDSET).toEqual([]);
  });

  it("derives a stable problem key from a blocker id", () => {
    expect(problemKeyForTrigger("abc")).toBe("blocker-abc");
  });
});
