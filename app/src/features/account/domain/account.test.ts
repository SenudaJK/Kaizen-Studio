import { describe, expect, it } from "vitest";
import { confirmsDeletion, onboardingSteps, passwordProblem } from "./account";

describe("confirmsDeletion", () => {
  it("matches the email ignoring case and padding", () => {
    expect(confirmsDeletion("  Me@Example.com ", "me@example.com")).toBe(true);
  });
  it("rejects anything else, including an empty string", () => {
    expect(confirmsDeletion("", "me@example.com")).toBe(false);
    expect(confirmsDeletion("delete", "me@example.com")).toBe(false);
  });
});

describe("passwordProblem", () => {
  it("requires 8+ characters", () => {
    expect(passwordProblem("oldpassword", "short")).toMatch(/8 characters/);
  });
  it("requires a different password", () => {
    expect(passwordProblem("samepassword", "samepassword")).toMatch(/different/);
  });
  it("accepts a good new password", () => {
    expect(passwordProblem("oldpassword", "brandnewpass")).toBeNull();
  });
});

describe("onboardingSteps", () => {
  it("starts with nothing done for a brand-new user", () => {
    expect(onboardingSteps({ routineSteps: 0, habits: 0, triggers: 0 }).every((s) => !s.done)).toBe(true);
  });
  it("marks each step done from its own count", () => {
    const steps = onboardingSteps({ routineSteps: 3, habits: 0, triggers: 1 });
    expect(steps.map((s) => s.done)).toEqual([true, false, true]);
  });
});
