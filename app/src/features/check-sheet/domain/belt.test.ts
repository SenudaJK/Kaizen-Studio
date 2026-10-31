import { describe, expect, it } from "vitest";
import { beltFor } from "./belt";

describe("beltFor", () => {
  it("starts everyone at White Belt", () => {
    const belt = beltFor(0);
    expect(belt.current.name).toBe("White Belt");
    expect(belt.next?.name).toBe("Yellow Belt");
    expect(belt.checkInsToNext).toBe(25);
  });

  it("promotes exactly at the threshold", () => {
    expect(beltFor(24).current.name).toBe("White Belt");
    expect(beltFor(25).current.name).toBe("Yellow Belt");
  });

  it("reports progress within a tier", () => {
    // Yellow spans 25 → 100, so 62 check-ins is 37/75 ≈ 49%.
    expect(beltFor(62).progressPct).toBe(49);
  });

  it("tops out at Black Belt", () => {
    const belt = beltFor(5000);
    expect(belt.current.name).toBe("Black Belt");
    expect(belt.next).toBeNull();
    expect(belt.progressPct).toBe(100);
  });
});
