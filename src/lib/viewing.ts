/**
 * Showroom viewing bookings: the rules both the browser and the server obey.
 *
 * Shared deliberately. The slot grid a visitor sees is rendered from the same
 * functions the API uses to decide whether the slot they picked was real, so a
 * hand-crafted POST cannot book 03:00 on a Sunday.
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

/** Owner-set, 2026-08-05: weekdays only, 08:00–15:30, no weekend viewings. */
export const OPEN_MINUTES = 8 * 60; // 08:00
export const CLOSE_MINUTES = 15 * 60 + 30; // 15:30
export const SLOT_MINUTES = 30;

/** Human form of the same hours, for copy and for openingHours schema. */
export const HOURS_LABEL = "Monday to Friday, 08:00 – 15:30";

/**
 * Earliest bookable day, in calendar days from today. 1 means the next
 * working day: a visitor cannot book a slot for this afternoon, which is the
 * owner's stated notice period.
 */
export const MIN_LEAD_DAYS = 1;

/** How far ahead the grid runs, in calendar days. */
export const BOOKING_WINDOW_DAYS = 28;

/** A viewing occupies this much of the owner's diary, including the write-up. */
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

/** "08:30". Slots always land on the half hour, but pad anyway. */
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

/** "Tuesday, 12 August 2026 at 08:30 – 09:00 (SAST)", for emails. */
export function formatSlotLong(day: DayKey, minutes: number): string {
  return `${formatDayLong(day)} at ${formatSlot(minutes)} – ${formatSlot(
    minutes + VIEWING_MINUTES,
  )} (SAST)`;
}

/* ----------------------------------------------------------------- slots */

/** Every slot start a full viewing fits into before closing time. */
export function slotStarts(): number[] {
  const starts: number[] = [];
  for (let m = OPEN_MINUTES; m + VIEWING_MINUTES <= CLOSE_MINUTES; m += SLOT_MINUTES) {
    starts.push(m);
  }
  return starts;
}

/** The weekdays inside the booking window, earliest first. */
export function bookableDays(now: Date = new Date()): DayKey[] {
  const today = sastDay(now);
  const days: DayKey[] = [];
  for (let offset = MIN_LEAD_DAYS; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    const day = addDays(today, offset);
    if (isWeekday(day)) days.push(day);
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
 * A slot survives if nothing in the diary overlaps it. Half-hour granularity
 * means a 20-minute meeting still takes the slot it sits in, which is the
 * honest answer: the owner cannot show someone a home in the ten minutes left
 * over.
 */
export function freeSlotsFor(day: DayKey, busy: BusyInterval[]): number[] {
  return slotStarts().filter((minutes) => {
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
