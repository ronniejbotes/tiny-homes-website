/**
 * GET /api/viewing/slots: the showroom slots still open, for the whole
 * four-week window, in one call.
 *
 * The whole grid rather than a day at a time, deliberately: it is one read of
 * the owner's diary instead of twenty, and it lets the picker grey out a fully
 * booked Thursday before anyone clicks it.
 *
 * The failure mode is the important part. If the diary cannot be read, this
 * answers `available: false` and offers nothing. It never falls back to
 * showing the full grid — a slot this route offers is a slot the site will
 * confirm on the spot, so offering one we have not checked would book the
 * owner into a meeting he is already in.
 */

import { NextResponse } from "next/server";
import { fetchBusyIntervals, isCalendarConfigured } from "@/lib/caldav";
import {
  BOOKING_WINDOW_DAYS,
  HOURS_LABEL,
  MIN_LEAD_DAYS,
  SLOT_MINUTES,
  availabilityGrid,
  bookableDays,
  sastToInstant,
  slotStarts,
} from "@/lib/viewing";

// tsdav needs a real TCP socket; this must not run on the Edge runtime.
export const runtime = "nodejs";

export interface SlotsResponse {
  /** Day key → the minutes-past-midnight each open slot starts at. */
  days: Record<string, number[]>;
  available: boolean;
  reason?: "not-configured" | "calendar-unreachable" | "fully-booked";
  /** Echoed so the page can describe the rules without hard-coding them. */
  rules: {
    hours: string;
    slotMinutes: number;
    leadDays: number;
    windowDays: number;
  };
}

function respond(body: SlotsResponse, status = 200) {
  return NextResponse.json(body, {
    status,
    // Availability is stale the moment the owner accepts a meeting. Nothing
    // between here and the browser may hold on to it.
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

const rules = {
  hours: HOURS_LABEL,
  slotMinutes: SLOT_MINUTES,
  leadDays: MIN_LEAD_DAYS,
  windowDays: BOOKING_WINDOW_DAYS,
};

export async function GET() {
  const now = new Date();
  const days = bookableDays(now);

  if (days.length === 0) {
    return respond({ days: {}, available: false, reason: "fully-booked", rules });
  }

  const from = sastToInstant(days[0], 0);
  const to = sastToInstant(days[days.length - 1], 24 * 60);

  if (!isCalendarConfigured()) {
    // Local development without iCloud credentials: hand back the full grid so
    // the picker and the booking flow can be worked on, and say plainly that
    // nothing was checked. In production this is a misconfiguration, and the
    // page falls back to "phone us" rather than promising a slot blind.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[viewing] iCloud not configured: offering every slot unchecked (development only).",
      );
      const unchecked: Record<string, number[]> = {};
      for (const day of days) unchecked[day] = slotStarts();
      return respond({ days: unchecked, available: true, rules });
    }
    console.error("[viewing] ICLOUD_APPLE_ID / ICLOUD_APP_PASSWORD are unset.");
    return respond({ days: {}, available: false, reason: "not-configured", rules });
  }

  try {
    const busy = await fetchBusyIntervals(from, to);
    const grid = availabilityGrid(busy, now);
    return respond({
      days: grid,
      available: Object.keys(grid).length > 0,
      ...(Object.keys(grid).length === 0 ? { reason: "fully-booked" as const } : {}),
      rules,
    });
  } catch (error) {
    console.error("[viewing] could not read the iCloud diary:", error);
    return respond({ days: {}, available: false, reason: "calendar-unreachable", rules });
  }
}
