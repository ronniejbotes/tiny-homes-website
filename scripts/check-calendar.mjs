#!/usr/bin/env node
/**
 * Read-only check of the iCloud calendar connection.
 *
 * Run after setting ICLOUD_APPLE_ID and ICLOUD_APP_PASSWORD, to answer the
 * three questions that actually come up:
 *
 *   1. Do the credentials work at all?
 *   2. What are the calendars called, so ICLOUD_CALENDAR_NAME can be set to
 *      the right one? (Apple's names are not always what the UI suggests.)
 *   3. Does the diary it reads look like the owner's real week?
 *
 * It writes NOTHING. No events are created, changed or deleted, so it is safe
 * to run against a live account as often as you like.
 *
 * Usage:
 *   npm run check-calendar
 */

import { readFileSync } from "node:fs";
import { createDAVClient } from "tsdav";

/* .env.local is not loaded outside Next, so parse it here. Values already in
   the environment win, which is what makes a one-off override possible:
   ICLOUD_APPLE_ID=other@icloud.com npm run check-calendar */
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] === undefined) {
      process.env[key] = raw.trim().replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local: fall through to whatever is in the environment.
}

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const APPLE_ID = process.env.ICLOUD_APPLE_ID;
const APP_PASSWORD = process.env.ICLOUD_APP_PASSWORD;
const WANTED = process.env.ICLOUD_CALENDAR_NAME?.trim();

if (!APPLE_ID || !APP_PASSWORD) {
  console.error(red("\n✗ ICLOUD_APPLE_ID / ICLOUD_APP_PASSWORD are not set.\n"));
  console.error("Add them to .env.local, then run this again.");
  console.error(dim("Generate the password at appleid.apple.com → Sign-In and Security"));
  console.error(dim("→ App-Specific Passwords. See docs/SHOWROOM-BOOKINGS.md.\n"));
  process.exit(1);
}

// A common paste error: Apple shows the password hyphenated, and quotes or
// stray spaces round-trip through some terminals.
if (/\s/.test(APP_PASSWORD)) {
  console.error(red("\n✗ ICLOUD_APP_PASSWORD contains a space."));
  console.error("  Apple's format is abcd-efgh-ijkl-mnop, with hyphens and no spaces.\n");
  process.exit(1);
}

console.log(`\n${bold("iCloud calendar check")}`);
console.log(dim(`Apple ID: ${APPLE_ID}`));
console.log(dim("Read-only — nothing will be created or changed.\n"));

let client;
try {
  client = await createDAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: { username: APPLE_ID, password: APP_PASSWORD },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
} catch (error) {
  console.error(red("✗ Could not sign in to iCloud.\n"));
  console.error(`  ${error?.message ?? error}\n`);
  console.error("  Usual causes:");
  console.error("   · the Apple ID password was used instead of an app-specific one");
  console.error("   · the app-specific password was revoked or mistyped");
  console.error("   · the Apple ID has no two-factor authentication enabled\n");
  process.exit(1);
}

console.log(green("✓ Signed in."));

const calendars = await client.fetchCalendars();
const events = calendars.filter((c) => !c.components || c.components.includes("VEVENT"));

if (events.length === 0) {
  console.error(red("\n✗ This account exposes no event calendars.\n"));
  process.exit(1);
}

const nameOf = (c) => (typeof c.displayName === "string" ? c.displayName : "(unnamed)");

// Which one the site would actually use, by the same rule as src/lib/caldav.ts.
const chosen = WANTED
  ? events.find((c) => nameOf(c).toLowerCase() === WANTED.toLowerCase())
  : events[0];

/* Count the next four weeks in EVERY calendar, not just the chosen one.
   This is the question that actually matters: an account routinely has three
   or four calendars and only one of them is the owner's real diary. Pointing
   the site at an empty one means offering every slot as free. */
const now = new Date();
const from = new Date(now.getTime());
const to = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

const counts = new Map();
for (const calendar of events) {
  try {
    const found = await client.fetchCalendarObjects({
      calendar,
      timeRange: { start: from.toISOString(), end: to.toISOString() },
      expand: true,
    });
    counts.set(calendar, found);
  } catch {
    counts.set(calendar, null);
  }
}

console.log(`\n${bold("Calendars that can hold viewings:")}`);
for (const calendar of events) {
  const found = counts.get(calendar);
  const n = found === null ? "unreadable" : `${found.length} in the next 4 weeks`;
  const mark = calendar === chosen ? green(" ← the site will use this one") : "";
  console.log(`  · ${bold(nameOf(calendar))} ${dim(`(${n})`)}${mark}`);
  console.log(dim(`      ${calendar.url}`));
}

// Two calendars sharing a name make ICLOUD_CALENDAR_NAME ambiguous: the lookup
// takes the first match, which may not be the one meant.
const byName = new Map();
for (const calendar of events) {
  const key = nameOf(calendar).toLowerCase();
  byName.set(key, (byName.get(key) ?? 0) + 1);
}
const duplicates = [...byName.entries()].filter(([, n]) => n > 1);
if (duplicates.length > 0) {
  console.log(
    `\n${red("!")} ${duplicates.map(([n]) => `"${n}"`).join(", ")} appears more than once.`,
  );
  console.log("  Selecting by name would pick whichever comes back first, which is not");
  console.log("  something to leave to chance. Set ICLOUD_CALENDAR_URL to the exact URL");
  console.log("  above instead — it wins over ICLOUD_CALENDAR_NAME.");
}

if (WANTED && !chosen) {
  console.error(
    red(`\n✗ ICLOUD_CALENDAR_NAME is "${WANTED}", which is not in the list above.`),
  );
  console.error("  Fix the spelling, or remove the variable to use the first one.\n");
  process.exit(1);
}
if (!WANTED) {
  console.log(
    dim(`\n  No ICLOUD_CALENDAR_NAME set, so the first one is used. Set it to be explicit.`),
  );
}

/* --- what the next four weeks look like, as the booking page would see it --- */

const objects = counts.get(chosen) ?? [];

console.log(`\n${bold(`Next 4 weeks in "${nameOf(chosen)}":`)}`);
console.log(`  ${objects.length} calendar ${objects.length === 1 ? "entry" : "entries"} found.`);

if (objects.length === 0) {
  console.log(dim("  An empty diary means every slot will be offered as free."));
  console.log(dim("  If that looks wrong, the commitments are probably on another calendar."));
} else {
  // A couple of real summaries, so it is obvious this is the right diary.
  const titles = objects
    .flatMap((o) => (typeof o.data === "string" ? o.data.split(/\r?\n/) : []))
    .filter((line) => line.startsWith("SUMMARY:"))
    .map((line) => line.slice(8).trim())
    .slice(0, 5);
  if (titles.length > 0) {
    console.log(dim("  Sample:"));
    for (const title of titles) console.log(dim(`   · ${title}`));
  }
}

console.log(`\n${green("✓ Connection works.")} Restart the app and the booking page will`);
console.log("  show real availability and confirm bookings automatically.\n");
console.log(dim("Remember to set the same two variables on Hostinger → Node.js app →"));
console.log(dim("Environment variables, then restart the app there.\n"));
