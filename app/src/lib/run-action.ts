import "server-only";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { type IsoDate } from "@/lib/dates";
import { requireUserId } from "@/lib/session";
import { getToday } from "@/lib/timezone";

/** Throw inside an action for an expected, user-facing failure ("That habit no longer exists"). */
export class ActionError extends Error {}

interface ActionContext<S extends z.ZodType> {
  /** Validated input. */
  data: z.output<S>;
  /** From the session, never from the client. */
  userId: string;
  /** The user's local calendar day. */
  today: IsoDate;
}

/**
 * The one way a server action runs. In order it:
 *  1. authenticates (server actions are public POST endpoints, so this is mandatory),
 *  2. validates the untrusted input,
 *  3. runs the handler,
 *  4. refreshes every page that might show the changed data.
 */
export async function runAction<S extends z.ZodType>(
  schema: S,
  input: unknown,
  handler: (ctx: ActionContext<S>) => Promise<void>,
): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That doesn't look right." };
  }

  try {
    await handler({ data: parsed.data, userId, today: await getToday() });
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, error: error.message };
    console.error("Server action failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  // Workspaces share data (a slip logged here feeds the Pareto chart elsewhere), so refresh
  // everything under the root layout rather than guessing which pages are affected.
  revalidatePath("/", "layout");
  return { ok: true };
}
