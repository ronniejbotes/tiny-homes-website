/**
 * The showroom's opening hours: the one source for the openingHours structured
 * data in schema.ts and the hours line on /contact, so the two cannot drift.
 *
 * Owner, 13 November 2026: viewing times are during the week, 09:00 to 16:00.
 * The Google Business Profile carries the same hours. (Until then: Mon–Thu
 * 08:00–16:00, Fri 08:00–13:00.) They are not bookable slots.
 * The online booker that used to offer viewing slots was removed on
 * 29 October 2026 (owner): a viewing is now arranged by email only, through the
 * #viewing section of /contact.
 */

/** 09:00, the door (owner, 13 November 2026). */
export const OPEN_MINUTES = 9 * 60;
/** 16:00 on a normal weekday. */
export const CLOSE_MINUTES = 16 * 60;

/**
 * Days that shut earlier than CLOSE_MINUTES, keyed 0 = Sunday … 6 = Saturday.
 * Empty since 13 November 2026: every weekday is 09:00 to 16:00 (owner). The
 * Friday 13:00 close set on 2026-09-04 no longer applies.
 */
export const WEEKDAY_CLOSE_MINUTES: Readonly<Record<number, number>> = {};

/** When a given weekday shuts; CLOSE_MINUTES for every day not named above. */
export function closeMinutesOn(weekday: number): number {
  return WEEKDAY_CLOSE_MINUTES[weekday] ?? CLOSE_MINUTES;
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** "Friday" from 5, in 0 = Sunday … 6 = Saturday terms. */
export function weekdayName(weekday: number): string {
  return WEEKDAY_NAMES[weekday];
}

/** "09:00" from 540. */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * The working week (Monday to Friday) as runs of consecutive days sharing a
 * closing time: today one run, Monday to Friday. Weekends and public holidays
 * are closed.
 */
export const OPENING_HOURS: ReadonlyArray<{
  days: number[];
  opens: number;
  closes: number;
}> = ((): { days: number[]; opens: number; closes: number }[] => {
  const spans: { days: number[]; opens: number; closes: number }[] = [];
  for (let weekday = 1; weekday <= 5; weekday += 1) {
    const closes = closeMinutesOn(weekday);
    const previous = spans[spans.length - 1];
    if (previous && previous.closes === closes) previous.days.push(weekday);
    else spans.push({ days: [weekday], opens: OPEN_MINUTES, closes });
  }
  return spans;
})();

/** "Monday to Thursday" from [1,2,3,4], "Friday" from [5]. */
function daySpanLabel(days: number[]): string {
  if (days.length === 1) return weekdayName(days[0]);
  return `${weekdayName(days[0])} to ${weekdayName(days[days.length - 1])}`;
}

/** "Monday to Friday 09:00 – 16:00". */
export const HOURS_LABEL = OPENING_HOURS.map(
  (span) => `${daySpanLabel(span.days)} ${formatTime(span.opens)} – ${formatTime(span.closes)}`,
).join(", ");
