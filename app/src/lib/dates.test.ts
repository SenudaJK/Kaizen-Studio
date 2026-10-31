import { describe, expect, it } from "vitest";
import { addDays, isIsoDate, isoWeekNumber, startOfWeek, todayIn, weekDays } from "./dates";

describe("dates", () => {
  it("validates real calendar dates only", () => {
    expect(isIsoDate("2026-10-29")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("29-10-2026")).toBe(false);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("finds Monday as the start of the week", () => {
    expect(startOfWeek("2026-10-29")).toBe("2026-10-26"); // Thursday
    expect(startOfWeek("2026-11-01")).toBe("2026-10-26"); // Sunday
    expect(startOfWeek("2026-10-26")).toBe("2026-10-26"); // Monday
  });

  it("lists seven consecutive days", () => {
    const days = weekDays("2026-10-26");
    expect(days).toHaveLength(7);
    expect(days[6]).toBe("2026-11-01");
  });

  it("computes ISO week numbers", () => {
    expect(isoWeekNumber("2026-01-01")).toBe(1);
    expect(isoWeekNumber("2026-10-29")).toBe(44);
  });

  it("resolves 'today' in the user's time zone, not the server's", () => {
    const instant = new Date("2026-10-29T23:30:00Z");
    expect(todayIn("UTC", instant)).toBe("2026-10-29");
    expect(todayIn("Asia/Colombo", instant)).toBe("2026-10-30"); // UTC+5:30
    expect(todayIn("America/Los_Angeles", instant)).toBe("2026-10-29");
  });
});
