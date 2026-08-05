/**
 * Turning iCalendar text into the spans of a diary that are spoken for.
 *
 * Split out from the CalDAV client on purpose: this half is pure, and it is
 * the half that has to be right. A parsing slip here does not throw or log —
 * it quietly reports a busy morning as free and books the owner into a
 * meeting he is already in. Pure functions are the only part of this feature
 * that can be checked exhaustively without an iCloud account, so it is worth
 * the file.
 */

import { SAST_OFFSET_MINUTES, TIME_ZONE, type BusyInterval } from "@/lib/viewing";

/**
 * Undo RFC 5545 line folding, then split into content lines. A folded line is
 * a CRLF followed by a single space or tab, and both the terminator and the
 * whitespace disappear.
 */
export function contentLines(ics: string): string[] {
  return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

interface RawProperty {
  params: Record<string, string>;
  value: string;
}

function parseProperty(line: string): { name: string; property: RawProperty } | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;

  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name, ...paramParts] = head.split(";");

  const params: Record<string, string> = {};
  for (const part of paramParts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).replace(/^"|"$/g, "");
  }

  return { name: name.toUpperCase(), property: { params, value } };
}

/* ----------------------------------------------------------- timezone maths */

/**
 * How far the named zone is from UTC at a given instant, in minutes.
 *
 * Formatting the instant in the target zone and reading it back as though it
 * were UTC gives the offset without a timezone database. Africa/Johannesburg
 * never moves, but a calendar can hold events stamped in any zone the owner
 * has travelled to, and those do observe daylight saving.
 */
function zoneOffsetMinutes(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  // Midnight formats as hour 24 in some ICU builds; normalise it to 0.
  const hour = get("hour") % 24;
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return (asUtc - instant.getTime()) / 60_000;
}

/** Resolve a wall-clock reading in a named zone to a real instant. */
function zonedToInstant(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  // Two passes: the first offset is looked up at the wrong instant whenever the
  // reading sits near a DST change, and re-reading at the corrected instant
  // settles it.
  let ts = guess - zoneOffsetMinutes(timeZone, new Date(guess)) * 60_000;
  ts = guess - zoneOffsetMinutes(timeZone, new Date(ts)) * 60_000;
  return new Date(ts);
}

interface DateValue {
  instant: Date;
  /** VALUE=DATE, i.e. an all-day event with no time component. */
  allDay: boolean;
}

/**
 * Read a DTSTART/DTEND/EXDATE value.
 *
 * Three forms exist and all three turn up in a real calendar: UTC (trailing
 * Z), a wall-clock reading qualified by TZID, and a bare "floating" reading.
 * Floating times are taken as South African, which is the only reading that
 * makes sense for a diary kept in Centurion.
 */
export function parseDateValue(property: RawProperty): DateValue | null {
  const raw = property.value.trim();

  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return {
      instant: new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0, -SAST_OFFSET_MINUTES)),
      allDay: true,
    };
  }

  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(raw);
  if (!dateTime) return null;

  const [, y, m, d, hh, mm, ss, zulu] = dateTime;
  const nums = [Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss)] as const;

  if (zulu) {
    return {
      instant: new Date(Date.UTC(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5])),
      allDay: false,
    };
  }

  const tzid = property.params.TZID || TIME_ZONE;
  try {
    return { instant: zonedToInstant(...nums, tzid), allDay: false };
  } catch {
    // An unknown TZID would otherwise throw out of Intl and lose the whole
    // diary read. Falling back to South African time keeps the event blocking.
    return { instant: zonedToInstant(...nums, TIME_ZONE), allDay: false };
  }
}

/* ------------------------------------------------------------- recurrence */

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * Expand a recurring event across the window.
 *
 * This is a safety net, not the primary path: the CalDAV read below asks the
 * server to expand recurrences itself, which iCloud honours, so a returned
 * event normally carries no RRULE at all. It exists because the alternative
 * failure — a standing Monday commitment silently not blocking Mondays — is
 * the one failure this feature must not have.
 *
 * Rules we do not understand are logged and skipped rather than guessed at.
 * Blocking conservatively on a rule we cannot read would take out the whole
 * booking funnel on one odd event, which costs the business more than the rare
 * clash it would prevent.
 */
function expandRecurrence(
  start: Date,
  durationMs: number,
  rrule: string,
  exceptions: Set<number>,
  windowStart: Date,
  windowEnd: Date,
  uid: string,
): BusyInterval[] {
  const rules: Record<string, string> = {};
  for (const part of rrule.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) rules[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
  }

  const freq = (rules.FREQ ?? "").toUpperCase();
  const interval = Math.max(1, Number(rules.INTERVAL) || 1);
  const count = Number(rules.COUNT) || Infinity;
  const until = rules.UNTIL
    ? (parseDateValue({ params: {}, value: rules.UNTIL })?.instant ?? null)
    : null;
  const byDay = rules.BYDAY
    ? rules.BYDAY.split(",").map((d) => WEEKDAY_CODES.indexOf(d.trim().slice(-2).toUpperCase()))
    : null;

  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) {
    console.error(`[caldav] unsupported RRULE (${rrule}) on event ${uid}; not blocking`);
    return [];
  }

  const intervals: BusyInterval[] = [];
  // Hard ceiling so a malformed rule can never spin: the window is four weeks
  // and the tightest supported rule is daily.
  const MAX_ITERATIONS = 800;

  let emitted = 0;
  const cursor = new Date(start);

  for (let i = 0; i < MAX_ITERATIONS && emitted < count; i += 1) {
    if (until && cursor > until) break;
    if (cursor > windowEnd) break;

    const dayOfWeek = cursor.getUTCDay();
    const matchesDay = !byDay || byDay.includes(dayOfWeek);

    if (matchesDay) {
      emitted += 1;
      const end = new Date(cursor.getTime() + durationMs);
      if (end > windowStart && cursor < windowEnd && !exceptions.has(cursor.getTime())) {
        intervals.push({ start: new Date(cursor), end });
      }
    }

    // WEEKLY with BYDAY walks day by day so each named weekday is visited;
    // the interval then applies to whole weeks, which is handled by only
    // advancing a full interval once a week has been covered.
    if (freq === "DAILY") cursor.setUTCDate(cursor.getUTCDate() + interval);
    else if (freq === "WEEKLY") {
      if (byDay) {
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        if (cursor.getUTCDay() === 1 && interval > 1) {
          cursor.setUTCDate(cursor.getUTCDate() + 7 * (interval - 1));
        }
      } else {
        cursor.setUTCDate(cursor.getUTCDate() + 7 * interval);
      }
    } else if (freq === "MONTHLY") cursor.setUTCMonth(cursor.getUTCMonth() + interval);
    else cursor.setUTCFullYear(cursor.getUTCFullYear() + interval);
  }

  return intervals;
}

/* ------------------------------------------------------------- busy times */

const DEFAULT_DURATION_MS = 60 * 60_000;

/** Turn one calendar object's iCalendar text into the spans it occupies. */
export function busyFromIcs(ics: string, windowStart: Date, windowEnd: Date): BusyInterval[] {
  const intervals: BusyInterval[] = [];

  let inEvent = false;
  let uid = "";
  let dtStart: DateValue | null = null;
  let dtEnd: DateValue | null = null;
  let durationMs: number | null = null;
  let rrule = "";
  let transparent = false;
  let cancelled = false;
  let exceptions = new Set<number>();

  const flush = () => {
    if (dtStart && !transparent && !cancelled) {
      const span =
        dtEnd
          ? dtEnd.instant.getTime() - dtStart.instant.getTime()
          : (durationMs ?? (dtStart.allDay ? 24 * 60 * 60_000 : DEFAULT_DURATION_MS));

      if (span > 0) {
        if (rrule) {
          intervals.push(
            ...expandRecurrence(
              dtStart.instant,
              span,
              rrule,
              exceptions,
              windowStart,
              windowEnd,
              uid,
            ),
          );
        } else {
          intervals.push({
            start: dtStart.instant,
            end: new Date(dtStart.instant.getTime() + span),
          });
        }
      }
    }

    inEvent = false;
    uid = "";
    dtStart = null;
    dtEnd = null;
    durationMs = null;
    rrule = "";
    transparent = false;
    cancelled = false;
    exceptions = new Set();
  };

  for (const line of contentLines(ics)) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      continue;
    }
    if (line === "END:VEVENT") {
      flush();
      continue;
    }
    if (!inEvent) continue;

    const parsed = parseProperty(line);
    if (!parsed) continue;
    const { name, property } = parsed;

    if (name === "UID") uid = property.value;
    else if (name === "DTSTART") dtStart = parseDateValue(property);
    else if (name === "DTEND") dtEnd = parseDateValue(property);
    else if (name === "DURATION") durationMs = parseDuration(property.value);
    else if (name === "RRULE") rrule = property.value;
    else if (name === "TRANSP") transparent = property.value.toUpperCase() === "TRANSPARENT";
    else if (name === "STATUS") cancelled = property.value.toUpperCase() === "CANCELLED";
    else if (name === "EXDATE") {
      for (const value of property.value.split(",")) {
        const date = parseDateValue({ params: property.params, value });
        if (date) exceptions.add(date.instant.getTime());
      }
    }
  }

  return intervals;
}

/** RFC 5545 durations, e.g. `PT1H30M`, `P1D`. */
export function parseDuration(value: string): number | null {
  const match = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    value.trim(),
  );
  if (!match) return null;
  const [, sign, w, d, h, m, s] = match;
  const total =
    (Number(w) || 0) * 7 * 86_400 +
    (Number(d) || 0) * 86_400 +
    (Number(h) || 0) * 3_600 +
    (Number(m) || 0) * 60 +
    (Number(s) || 0);
  return (sign === "-" ? -total : total) * 1000;
}

