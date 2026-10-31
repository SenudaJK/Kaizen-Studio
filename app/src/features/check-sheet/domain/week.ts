import { isIsoDate, startOfWeek, type IsoDate } from "@/lib/dates";

/**
 * Turns the `?week=` URL parameter into the Monday to show.
 * Anything missing, malformed or in the future falls back to the current week.
 */
export function resolveWeekStart(param: string | string[] | undefined, today: IsoDate): IsoDate {
  const currentWeek = startOfWeek(today);
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw || !isIsoDate(raw)) return currentWeek;
  const requested = startOfWeek(raw);
  return requested > currentWeek ? currentWeek : requested;
}
