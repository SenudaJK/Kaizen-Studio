import "server-only";
import { prisma } from "@/lib/prisma";

export interface AccountSettings {
  name: string | null;
  email: string;
  /** False for Google-only accounts: there's no password to change. */
  hasPassword: boolean;
  /** OAuth providers linked to the account, e.g. "google". */
  providers: string[];
  createdAt: Date;
}

export async function getAccountSettings(userId: string): Promise<AccountSettings | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, passwordHash: true, createdAt: true, accounts: { select: { provider: true } } },
  });
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    hasPassword: user.passwordHash !== null,
    providers: user.accounts.map((a) => a.provider),
    createdAt: user.createdAt,
  };
}
