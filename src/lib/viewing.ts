/**
 * Showroom viewing bookings: the rules both the browser and the server obey.
 *
 * Shared deliberately. The slot grid a visitor sees is rendered from the same
 * functions the API uses to decide whether the slot they picked was real, so a
 * hand-crafted POST cannot book 03:00 on a Sunday, or 10:00 on any day.
 *
 * Safe to import from a client component: no Node APIs, no secrets.
 */

/**
 * South Africa is UTC+2 the whole year round — the country has observed no
 * daylight saving since 1944 — so a fixed offset here is exact rather than an
 * approximation. That is what lets the rest of this file do its arithmetic in
 * plain UTC and stay correct no matter what timezone the server process runs
 * in, which on shared hosting is not something we get to choose.
 */
export const SAST_OFFSET_MINUTES = 120;
export const TIME_ZONE = "Africa/Johannesburg";

/* --------------------------------------------------------- opening hours */

/**
 * Owner-set, revised 2026-08-20: weekdays only, hour-long viewings, the first
 * starting at 09:00 and the last finishing at 16:00. Nothing on a weekend and
 * nothing on a public holiday.
 *
 * The day is not a plain run of hourly slots between those two times, though
 * — see CLOSED_BLOCKS.
 */
export const OPEN_MINUTES = 9 * 60; // 09:00
export const CLOSE_MINUTES = 16 * 60; // 16:00, so the last start is 15:00
export const SLOT_MINUTES = 60;

/**
 * Hours inside the working day that are held back, and so never offered.
 *
 * The owner keeps the hour after each viewing for the follow-up and the
 * paperwork it generates, which is why the grid alternates rather than running
 * straight through: 09:00, 11:00, 13:00 and 15:00, and nothing else.
 *
 * Enforced in slotStarts(), which is what both the grid a visitor is shown and
 * the server-side check on a submitted booking are built from — so a
 * hand-crafted POST cannot buy an hour that is blocked here.
 */
export const CLOSED_BLOCKS: ReadonlyArray<{ start: number; end: number }> = [
  { start: 10 * 60, end: 11 * 60 },
  { start: 12 * 60, end: 13 * 60 },
  { start: 14 * 60, end: 15 * 60 },
];

/**
 * Hours held back on one weekday only, keyed by day of the week in the same
 * 0 = Sunday … 6 = Saturday terms as sastWeekday().
 *
 * Owner-set, revised 2026-08-25: the 13:00 viewing is not offered on a Friday.
 * Everything else about a Friday is a normal working day, so this cannot be
 * expressed in CLOSED_BLOCKS, which applies to every day alike.
 *
 * Only honoured by the day-aware form of slotStarts(), which is what
 * freeSlotsFor() — and so both the grid and the server-side check on a
 * submitted booking — goes through. Call slotStarts() with no day only where
 * the question really is about the standard timetable rather than a date.
 */
export const WEEKDAY_CLOSED_BLOCKS: Readonly<
  Record<number, ReadonlyArray<{ start: number; end: number }>>
> = {
  5: [{ start: 13 * 60, end: 14 * 60 }], // Friday
};

/**
 * Human form of the span the showroom works over, for copy and for the
 * openingHours schema. It is the outer bounds, not the list of slots — where
 * a visitor is actually choosing a time, say SLOT_TIMES_LABEL instead.
 */
export const HOURS_LABEL = "Monday to Friday, 09:00 – 16:00";

/** A viewing's length as it should read in prose, rather than "60 minutes". */
export const VIEWING_LENGTH_LABEL = "one hour";

/**
 * Earliest bookable day, in calendar days from today.
 *
 * 1 is the owner's stated notice period and means **no same-day bookings**:
 * the earliest a visitor can come is tomorrow, and if tomorrow is a weekend
 * or a public holiday, the next working day after that. Nobody turns up at
 * the showroom on an hour's notice.
 *
 * Do not set this to 0 without being asked to. It is the one constant here
 * that looks like a harmless off-by-one and is actually a promise about how
 * much warning the owner gets.
 */
export const MIN_LEAD_DAYS = 1;

/** How far ahead the grid runs, in calendar days. */
export const BOOKING_WINDOW_DAYS = 28;

/** A viewing occupies this much of the owner's diary. */
export const VIEWING_MINUTES = SLOT_MINUTES;

/* ------------------------------------------------------------ SAST clock */

/** `YYYY-MM-DD`, always a South African calendar date. */
export type DayKey = string;

export const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Shift an instant into SAST so UTC getters read as South African wall time. */
function shifted(instant: Date): Date {
  return new Date(instant.getTime() + SAST_OFFSET_MINUTES * 60_000);
}

/** The South African calendar date an instant falls on. */
export function sastDay(instant: Date): DayKey {
  return shifted(instant).toISOString().slice(0, 10);
}

/** Minutes past South African midnight. */
export function sastMinutes(instant: Date): number {
  const s = shifted(instant);
  return s.getUTCHours() * 60 + s.getUTCMinutes();
}

/** 0 = Sunday … 6 = Saturday, in South African local terms. */
export function sastWeekday(day: DayKey): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * The exact instant a South African wall-clock time falls on.
 * `Date.UTC` normalises out-of-range minutes, so subtracting the offset to
 * cross back over midnight is safe.
 */
export function sastToInstant(day: DayKey, minutes: number): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes - SAST_OFFSET_MINUTES));
}

/** Move a day key forward by whole days without tripping over month ends. */
export function addDays(day: DayKey, count: number): DayKey {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + count)).toISOString().slice(0, 10);
}

export function isWeekday(day: DayKey): boolean {
  const weekday = sastWeekday(day);
  return weekday >= 1 && weekday <= 5;
}

/* ------------------------------------------------------- public holidays */

/**
 * South African public holidays, computed rather than listed.
 *
 * A hard-coded table is the obvious way to do this and the wrong one: it goes
 * stale silently, and the failure is a visitor booked in for a Freedom Day
 * nobody is at the showroom for. Everything below is derived, so the rules
 * hold for any year the site is still running in.
 *
 * The fixed dates are the Public Holidays Act 36 of 1994. Good Friday and
 * Family Day move with Easter and are derived from it. The Act's Sunday rule
 * is applied too — a holiday falling on a Sunday makes the following Monday a
 * public holiday — which is the only half of that rule that can reach us,
 * since Sundays are not on offer in the first place.
 *
 * What this cannot know is a once-off holiday proclaimed by the President: an
 * election day, a national day of mourning. Those go in EXTRA_PUBLIC_HOLIDAYS
 * as they are gazetted.
 */
export const EXTRA_PUBLIC_HOLIDAYS: ReadonlyArray<DayKey> = [];

/** [month, day] of each holiday whose date never moves. */
const FIXED_HOLIDAYS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], // New Year's Day
  [3, 21], // Human Rights Day
  [4, 27], // Freedom Day
  [5, 1], // Workers' Day
  [6, 16], // Youth Day
  [8, 9], // National Women's Day
  [9, 24], // Heritage Day
  [12, 16], // Day of Reconciliation
  [12, 25], // Christmas Day
  [12, 26], // Day of Goodwill
];

/**
 * Gregorian Easter Sunday, by the Meeus/Jones/Butcher algorithm. Pure
 * integer arithmetic, exact for every year in the Gregorian calendar.
 */
function easterSunday(year: number): DayKey {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const dayOfMonth = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, dayOfMonth)).toISOString().slice(0, 10);
}

/** Memoised per year: the grid asks about the same handful of years all day. */
const holidayCache = new Map<number, Set<DayKey>>();

function publicHolidaysIn(year: number): Set<DayKey> {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const days = new Set<DayKey>();
  for (const [month, dayOfMonth] of FIXED_HOLIDAYS) {
    days.add(
      `${year}-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`,
    );
  }

  const easter = easterSunday(year);
  days.add(addDays(easter, -2)); // Good Friday
  days.add(addDays(easter, 1)); // Family Day

  // Iterating a snapshot, not the live set: the Mondays being added are never
  // themselves Sundays, so there is nothing to cascade, but reading and
  // writing the same set in one loop is not something to leave to chance.
  for (const day of [...days]) {
    if (sastWeekday(day) === 0) days.add(addDays(day, 1));
  }

  for (const day of EXTRA_PUBLIC_HOLIDAYS) {
    if (day.startsWith(`${year}-`)) days.add(day);
  }

  holidayCache.set(year, days);
  return days;
}

/** Whether a South African calendar date is a public holiday. */
export function isPublicHoliday(day: DayKey): boolean {
  return publicHolidaysIn(Number(day.slice(0, 4))).has(day);
}

/** A day the showroom opens at all: a weekday that is not a public holiday. */
export function isOpenDay(day: DayKey): boolean {
  return isWeekday(day) && !isPublicHoliday(day);
}

/* ------------------------------------------------------------ formatting */

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "09:00". Slots always land on the hour, but pad anyway. */
export function formatSlot(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "Tuesday, 12 August 2026". */
export function formatDayLong(day: DayKey): string {
  const [y, m, d] = day.split("-").map(Number);
  return `${WEEKDAY_NAMES[sastWeekday(day)]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** "Tue 12 Aug", for the compact day chips on the picker. */
export function formatDayShort(day: DayKey): string {
  const [, m, d] = day.split("-").map(Number);
  return `${WEEKDAY_NAMES[sastWeekday(day)].slice(0, 3)} ${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`;
}

/** "Tuesday, 12 August 2026 at 09:00 – 10:00 (SAST)", for emails. */
export function formatSlotLong(day: DayKey, minutes: number): string {
  return `${formatDayLong(day)} at ${formatSlot(minutes)} – ${formatSlot(
    minutes + VIEWING_MINUTES,
  )} (SAST)`;
}

/* ----------------------------------------------------------------- slots */

/**
 * Every slot start a full viewing fits into before closing time, minus the
 * hours held back in CLOSED_BLOCKS. Today: 09:00, 11:00, 13:00 and 15:00.
 *
 * Given a day, the blocks that day's weekday holds back are taken out too, so
 * a Friday comes back as 09:00, 11:00 and 15:00. Given nothing, the answer is
 * the standard timetable — right for copy, wrong for deciding whether a
 * particular booking is real, so pass the day wherever there is one.
 */
export function slotStarts(day?: DayKey): number[] {
  return slotStartsOn(day ? sastWeekday(day) : undefined);
}

/** slotStarts() by weekday number, for the copy below that has no date. */
function slotStartsOn(weekday?: number): number[] {
  const weekly = weekday === undefined ? [] : (WEEKDAY_CLOSED_BLOCKS[weekday] ?? []);
  const starts: number[] = [];
  for (let m = OPEN_MINUTES; m + VIEWING_MINUTES <= CLOSE_MINUTES; m += SLOT_MINUTES) {
    const end = m + VIEWING_MINUTES;
    const blocked = [...CLOSED_BLOCKS, ...weekly].some((b) => m < b.end && end > b.start);
    if (!blocked) starts.push(m);
  }
  return starts;
}

/** "09:00, 11:00 and 15:00" from [540, 660, 900]. */
function joinTimes(minutes: number[]): string {
  const times = minutes.map(formatSlot);
  if (times.length < 2) return times.join("");
  return `${times.slice(0, -1).join(", ")} and ${times[times.length - 1]}`;
}

/**
 * "09:00, 11:00, 13:00 and 15:00" — the honest companion to HOURS_LABEL, for
 * copy that would otherwise imply every hour between 09:00 and 16:00 is on
 * offer. Derived, so the sentence cannot drift away from the grid.
 */
export const SLOT_TIMES_LABEL = joinTimes(slotStarts());

/**
 * "13:00" — the standard slots a Friday is short of, and "" on a Friday that
 * runs the standard timetable, in which case the sentence using this should
 * disappear with it. Derived from WEEKDAY_CLOSED_BLOCKS, so copy saying a
 * Friday is different cannot outlive the rule that makes it different.
 */
export const FRIDAY_MISSING_SLOTS_LABEL = ((): string => {
  const friday = new Set(slotStartsOn(5));
  return joinTimes(slotStarts().filter((m) => !friday.has(m)));
})();

/** The open days inside the booking window, earliest first. */
export function bookableDays(now: Date = new Date()): DayKey[] {
  const today = sastDay(now);
  const days: DayKey[] = [];
  for (let offset = MIN_LEAD_DAYS; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    const day = addDays(today, offset);
    if (isOpenDay(day)) days.push(day);
  }
  return days;
}

/** Whether a day is one this site would ever offer, independent of the diary. */
export function isBookableDay(day: string, now: Date = new Date()): day is DayKey {
  if (!DAY_KEY_RE.test(day)) return false;
  // Round-trips through the date maths, so "2026-02-31" is rejected rather
  // than silently rolling into March.
  const [y, m, d] = day.split("-").map(Number);
  const normalised = new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
  if (normalised !== day) return false;
  return bookableDays(now).includes(day);
}

/** A span of the owner's diary that is already spoken for. */
export interface BusyInterval {
  start: Date;
  end: Date;
}

function overlapsBusy(start: Date, end: Date, busy: BusyInterval[]): boolean {
  return busy.some((b) => start < b.end && end > b.start);
}

/**
 * The slots still open on a given day.
 *
 * A slot survives if nothing in the diary overlaps it. Whole-hour granularity
 * means a 20-minute meeting still takes the whole slot it sits in, which is
 * the honest answer: the owner cannot show someone a home around it.
 */
export function freeSlotsFor(day: DayKey, busy: BusyInterval[]): number[] {
  return slotStarts(day).filter((minutes) => {
    const start = sastToInstant(day, minutes);
    const end = sastToInstant(day, minutes + VIEWING_MINUTES);
    return !overlapsBusy(start, end, busy);
  });
}

/** The whole grid: every offered day mapped to the slots still open on it. */
export function availabilityGrid(
  busy: BusyInterval[],
  now: Date = new Date(),
): Record<DayKey, number[]> {
  const grid: Record<DayKey, number[]> = {};
  for (const day of bookableDays(now)) {
    const free = freeSlotsFor(day, busy);
    if (free.length > 0) grid[day] = free;
  }
  return grid;
}

/* ------------------------------------------------------------- the booking */

/** What a visitor tells us. `interest` is the product they came to see. */
export interface ViewingDetails {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  /** Product slug, or "" when they have not decided yet. */
  interest: string;
  /** How many people are coming, 1–10. */
  partySize: number;
  notes: string;
}

export interface ViewingBooking extends ViewingDetails {
  reference: string;
  day: DayKey;
  /** Minutes past South African midnight. */
  minutes: number;
}

export const PARTY_MIN = 1;
export const PARTY_MAX = 10;

/** Same shape as a quote reference so the office files them the same way. */
export function makeViewingReference(now: Date = new Date()): string {
  const day = sastDay(now).replace(/-/g, "").slice(2);
  const tail = Math.floor(1000 + Math.random() * 9000);
  return `THV-${day}-${tail}`;
}

export const VIEWING_REFERENCE_RE = /^THV-\d{6}-\d{4}$/;
