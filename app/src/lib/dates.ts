/**
 * Calendar-date helpers.
 *
 * The app thinks in plain calendar days ("2026-10-29"), never in timestamps, for anything
 * a user checks off. `IsoDate` strings sort lexicographically, serialize cleanly across the
 * server/client boundary, and map 1:1 onto Postgres `DATE` columns.
 */

export type IsoDate = `${number}-${number}-${number}`;

const MS_PER_DAY = 86_400_000;

export function isIsoDate(value: string): value is IsoDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** "Today" for someone in the given IANA time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): IsoDate {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now) as IsoDate;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const ms = new Date(`${date}T00:00:00.000Z`).getTime() + days * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10) as IsoDate;
}

/** Monday of the week containing `date` (weeks run Monday to Sunday). */
export function startOfWeek(date: IsoDate): IsoDate {
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
  const sinceMonday = (weekday + 6) % 7;
  return addDays(date, -sinceMonday);
}

/** The seven days (Monday to Sunday) of the week starting at `weekStart`. */
export function weekDays(weekStart: IsoDate): IsoDate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round(
    (new Date(`${to}T00:00:00.000Z`).getTime() - new Date(`${from}T00:00:00.000Z`).getTime()) / MS_PER_DAY,
  );
}

/** ISO-8601 week number (the "Week 44" people see on calendars). */
export function isoWeekNumber(date: IsoDate): number {
  const thursday = addDays(startOfWeek(date), 3);
  const jan1 = `${thursday.slice(0, 4)}-01-01` as IsoDate;
  return Math.floor(daysBetween(jan1, thursday) / 7) + 1;
}

/** Prisma `@db.Date` columns take a Date at UTC midnight. */
export function toDbDate(date: IsoDate): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function fromDbDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10) as IsoDate;
}

// Formatting is done in UTC because an IsoDate has no time-of-day to shift.
const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });

const weekdayShort = fmt({ weekday: "short" });
const dayOfMonth = fmt({ day: "numeric" });
const longDate = fmt({ weekday: "long", month: "long", day: "numeric" });
const rangeDate = fmt({ month: "short", day: "numeric" });

const at = (date: IsoDate) => new Date(`${date}T00:00:00.000Z`);

export const formatWeekdayShort = (date: IsoDate) => weekdayShort.format(at(date));
export const formatDayOfMonth = (date: IsoDate) => dayOfMonth.format(at(date));
export const formatLongDate = (date: IsoDate) => longDate.format(at(date));
export const formatShortDate = (date: IsoDate) => rangeDate.format(at(date));
export const formatWeekRange = (weekStart: IsoDate) =>
  `${rangeDate.format(at(weekStart))} – ${rangeDate.format(at(addDays(weekStart, 6)))}`;

/** Hour of day (0–23) for someone in the given time zone. */
export function hourIn(timeZone: string, now: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now));
}
