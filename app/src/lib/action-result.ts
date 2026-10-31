/** What every server action returns, so the UI handles success and failure the same way. */
export type ActionResult = { ok: true } | { ok: false; error: string };

export const actionOk: ActionResult = { ok: true };
