/** Pure account rules. No React, Prisma or Next imports. */

export const MIN_PASSWORD_LENGTH = 8;

/** Deleting is irreversible, so the user must type their own email exactly (ignoring case and padding). */
export function confirmsDeletion(typed: string, email: string): boolean {
  return typed.trim().toLowerCase() === email.trim().toLowerCase();
}

/** Why a new password can't be used, or null when it's fine. */
export function passwordProblem(current: string, next: string): string | null {
  if (next.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (next === current) return "Pick a password different from your current one.";
  return null;
}

export interface OnboardingInput {
  routineSteps: number;
  habits: number;
  triggers: number;
}

export interface OnboardingStep {
  key: "routine" | "habit" | "trigger";
  title: string;
  hint: string;
  done: boolean;
}

/** The three things a new user does first. Derived from real rows, so nothing is stored or seeded. */
export function onboardingSteps({ routineSteps, habits, triggers }: OnboardingInput): OnboardingStep[] {
  return [
    { key: "routine", title: "Build a routine", hint: "Add the steps of your morning or evening flow.", done: routineSteps > 0 },
    { key: "habit", title: "Track a habit", hint: "Add one habit to your weekly check sheet.", done: habits > 0 },
    { key: "trigger", title: "Name a blocker", hint: "Add something that tends to derail you, so slips get counted.", done: triggers > 0 },
  ];
}
