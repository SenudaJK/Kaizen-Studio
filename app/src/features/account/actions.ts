"use server";

import bcrypt from "bcryptjs";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ActionError, runAction } from "@/lib/run-action";
import type { ActionResult } from "@/lib/action-result";
import { confirmsDeletion, passwordProblem } from "./domain/account";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "./schemas";

/** Write side of Account & settings. Every query is keyed by the session's `userId`. */

export async function updateProfile(input: unknown): Promise<ActionResult> {
  return runAction(updateProfileSchema, input, async ({ data, userId }) => {
    await prisma.user.update({ where: { id: userId }, data: { name: data.name || null } });
  });
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  return runAction(changePasswordSchema, input, async ({ data, userId }) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user?.passwordHash) throw new ActionError("This account signs in with Google, so it has no password.");

    if (!(await bcrypt.compare(data.current, user.passwordHash))) throw new ActionError("Your current password is incorrect.");
    const problem = passwordProblem(data.current, data.next);
    if (problem) throw new ActionError(problem);

    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(data.next, 10) } });
  });
}

/** Permanently deletes the user; every workspace table cascades from `User`. Signs out on success. */
export async function deleteAccount(input: unknown): Promise<ActionResult> {
  const result = await runAction(deleteAccountSchema, input, async ({ data, userId }) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new ActionError("This account no longer exists.");
    if (!confirmsDeletion(data.email, user.email)) throw new ActionError("That email doesn't match your account.");
    await prisma.user.delete({ where: { id: userId } });
  });
  if (result.ok) await signOut({ redirectTo: "/login" });
  return result;
}
