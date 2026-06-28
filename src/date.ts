/** Default calendar day for prompts when no date is specified (US Pacific). */
export const DEFAULT_PROMPT_TIMEZONE = "America/Los_Angeles";

const resolvedTimezone = () =>
  process.env.PROMPT_TIMEZONE ?? DEFAULT_PROMPT_TIMEZONE;

/** YYYY-MM-DD for a Date in an IANA timezone. */
export function formatIsoDateInTimeZone(
  date: Date,
  timeZone: string = resolvedTimezone(),
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** YYYY-MM-DD for the current calendar day in an IANA timezone. */
export function todayIsoDate(timeZone: string = resolvedTimezone()): string {
  return formatIsoDateInTimeZone(new Date(), timeZone);
}

/** Add calendar days to a YYYY-MM-DD string (timezone-agnostic). */
export function addCalendarDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}
