import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * The signed-in user's id. This is the ONLY place user identity enters data access:
 * every query and mutation takes the id from here, never from client input.
 * Memoized per request so layouts, pages and actions can all call it freely.
 */
export const requireUserId = cache(async (): Promise<string> => {
  // Per-user data must never be baked into the prefetched app shell, so opt into request time.
  await connection();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");
  return userId;
});

/** Display info for the signed-in user (name and email only; never the password hash). */
export const getCurrentUser = cache(async (): Promise<{ name: string | null; email: string }> => {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user) redirect("/login");
  return user;
});
