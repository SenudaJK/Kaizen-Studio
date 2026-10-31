import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { isValidTimeZone, todayIn, type IsoDate } from "@/lib/dates";

/** Written by the browser (see TimezoneSync) so the server knows what "today" means for this user. */
export const TIMEZONE_COOKIE = "kz_tz";

export const getUserTimeZone = cache(async (): Promise<string> => {
  // "Today" depends on the current time, which a prefetched shell can't know: wait for a real request.
  await connection();
  const stored = (await cookies()).get(TIMEZONE_COOKIE)?.value;
  return stored && isValidTimeZone(stored) ? stored : "UTC";
});

export const getToday = cache(async (): Promise<IsoDate> => todayIn(await getUserTimeZone()));
