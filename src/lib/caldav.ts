/**
 * Reads the owner's iCloud diary and writes confirmed viewings back into it.
 *
 * Server-only; never import this from a "use client" module. It holds the
 * app-specific password.
 *
 * Why CalDAV and not a calendar API: the business runs on Apple Calendar, and
 * CalDAV is how Apple Calendar itself talks to iCloud. An app-specific
 * password (appleid.apple.com → Sign-In and Security) is scoped to this one
 * integration and can be revoked without touching the Apple ID password. It is
 * the same route Fantastical and Cal.com take for Apple accounts.
 *
 * Why a client library rather than hand-rolled XML: the failure mode here is
 * not a broken page, it is quietly telling a visitor that 10:00 on Thursday is
 * free when the owner is already out on a delivery. Discovery, namespace
 * prefixes and multistatus parsing are exactly the kind of thing that works on
 * the happy path and breaks on the one response shape you did not anticipate.
 */

import { createDAVClient, type DAVCalendar } from "tsdav";
import { busyFromIcs } from "@/lib/ical-parse";
import type { BusyInterval } from "@/lib/viewing";

const ICLOUD_CALDAV_URL = "https://caldav.icloud.com";

/** iCloud is not always quick. A slow diary must not hold a page hostage. */
const REQUEST_TIMEOUT_MS = 12_000;

export function isCalendarConfigured(): boolean {
  return Boolean(process.env.ICLOUD_APPLE_ID && process.env.ICLOUD_APP_PASSWORD);
}

/* ------------------------------------------------------- connection cache */

type Client = Awaited<ReturnType<typeof createDAVClient>>;

interface Connection {
  client: Client;
  calendar: DAVCalendar;
}

/**
 * Discovery costs three round trips (principal → calendar home → calendar
 * list), so it is done once per process rather than once per visitor. Cleared
 * on any failure, so a revoked password recovers on the next deploy-free retry
 * rather than wedging until a restart.
 */
let connection: Promise<Connection> | null = null;

function calendarName(collection: DAVCalendar): string {
  const name = collection.displayName;
  return typeof name === "string" ? name : "";
}

async function connect(): Promise<Connection> {
  const client = await createDAVClient({
    serverUrl: ICLOUD_CALDAV_URL,
    credentials: {
      username: process.env.ICLOUD_APPLE_ID as string,
      password: process.env.ICLOUD_APP_PASSWORD as string,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
    fetchOptions: { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  });

  const calendars = await client.fetchCalendars();

  // Only calendars that hold events are candidates: an iCloud account also
  // exposes reminder collections, and writing a viewing into one of those
  // would put it somewhere the owner never looks.
  const eventCalendars = calendars.filter(
    (c) => !c.components || c.components.includes("VEVENT"),
  );

  const wanted = process.env.ICLOUD_CALENDAR_NAME?.trim();
  const calendar = wanted
    ? eventCalendars.find((c) => calendarName(c).toLowerCase() === wanted.toLowerCase())
    : eventCalendars[0];

  if (!calendar) {
    const available = eventCalendars.map(calendarName).filter(Boolean).join(", ");
    throw new Error(
      wanted
        ? `iCloud calendar "${wanted}" not found. Available: ${available || "none"}`
        : "The iCloud account exposes no event calendars.",
    );
  }

  return { client, calendar };
}

function getConnection(): Promise<Connection> {
  if (!connection) {
    connection = connect().catch((error) => {
      connection = null;
      throw error;
    });
  }
  return connection;
}

/* --------------------------------------------------------------- the reads */

interface CachedBusy {
  key: string;
  at: number;
  intervals: BusyInterval[];
}

/**
 * A short cache in front of iCloud.
 *
 * The slot grid is fetched on every visit to the booking page, and the diary
 * does not change minute to minute. Sixty seconds keeps iCloud from being
 * hammered while staying far inside the window where a stale read could matter
 * — and the booking route re-checks the chosen slot against a fresh read
 * regardless, so the cache can never be the thing that double-books anyone.
 */
const BUSY_TTL_MS = 60_000;
let cachedBusy: CachedBusy | null = null;

/**
 * Every span the owner is already committed to between two instants.
 *
 * Throws if the diary cannot be read. Callers must treat that as "availability
 * unknown" and say so, never as "everything is free".
 */
export async function fetchBusyIntervals(from: Date, to: Date): Promise<BusyInterval[]> {
  const key = `${from.toISOString()}|${to.toISOString()}`;
  if (cachedBusy && cachedBusy.key === key && Date.now() - cachedBusy.at < BUSY_TTL_MS) {
    return cachedBusy.intervals;
  }

  const { client, calendar } = await getConnection();

  const objects = await client.fetchCalendarObjects({
    calendar,
    timeRange: { start: from.toISOString(), end: to.toISOString() },
    // Ask iCloud to resolve recurring events into concrete instances. Without
    // it the server returns the original series master, whose DTSTART may be
    // years ago, and a standing commitment would block nothing.
    expand: true,
    fetchOptions: { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  });

  const intervals = objects
    .flatMap((object) =>
      typeof object.data === "string" ? busyFromIcs(object.data, from, to) : [],
    )
    // The time-range filter is applied by the server per event, not per
    // instance, so trim anything that landed outside the window anyway.
    .filter((interval) => interval.end > from && interval.start < to);

  cachedBusy = { key, at: Date.now(), intervals };
  return intervals;
}

/** Drop the cached diary, so the next read goes to iCloud. */
export function invalidateBusyCache(): void {
  cachedBusy = null;
}

/**
 * Write a confirmed viewing into the owner's calendar.
 *
 * Throws on failure. The caller decides what that means for the visitor — and
 * for a booking it means the whole thing failed, because a confirmation we
 * cannot put in the diary is a promise nobody will keep.
 */
export async function createCalendarEvent(uid: string, ics: string): Promise<void> {
  const { client, calendar } = await getConnection();

  const response = await client.createCalendarObject({
    calendar,
    filename: `${uid}.ics`,
    iCalString: ics,
    fetchOptions: { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  });

  if (!response.ok) {
    throw new Error(
      `iCloud rejected the viewing event: ${response.status} ${response.statusText}`,
    );
  }

  // The diary just changed, so the next visitor must not be offered the slot
  // that was taken a second ago.
  invalidateBusyCache();
}
