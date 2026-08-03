/**
 * Coastal-site detection for the quote flow.
 *
 * Why this exists: salt air eats standard steel cladding. A unit delivered near
 * the sea without the corrosion-resistant exterior is visibly rusting within
 * about five years: a warranty problem and a reputation problem that surfaces
 * long after the sale. So the corrosion upgrade is not an upsell at the coast,
 * it is part of the specification, and the quote has to say so before the
 * customer commits rather than after.
 *
 * The risk here is deliberately asymmetric. Wrongly flagging an inland farm in
 * the Karoo costs a sentence of explanation the customer can ignore; missing a
 * house in Ballito costs a rusted unit. Everything below therefore errs towards
 * flagging, and never towards silence.
 *
 * Detection is name-based rather than a postal-code or lat/long lookup. Postal
 * codes would imply a precision this has no data to back, SA codes are not
 * ordered by distance from the sea, and a wrong range would fail silently in
 * exactly the direction that hurts. A named town the office would recognise is
 * honest about what it knows, and the province tier catches the rest.
 */

import type { AddressValues } from "@/lib/quote";

export type CoastalRisk =
  /** A named coastal town; treat the corrosion specification as required. */
  | "coastal"
  /** A province with coastline, but an unrecognised town. Advisory only. */
  | "possibly-coastal"
  /** Landlocked province: no coastal exposure. */
  | "inland";

/** The four provinces with a coastline. The other five cannot be coastal. */
const COASTAL_PROVINCES = new Set([
  "western cape",
  "eastern cape",
  "kwazulu-natal",
  "northern cape",
]);

/**
 * Towns and suburbs on or within a few kilometres of the sea, where salt
 * exposure is a given. Not exhaustive; it does not need to be, because the
 * province tier below catches anything missing and still raises the flag.
 */
const COASTAL_TOWNS = new Set([
  // Western Cape: Cape Peninsula and False Bay
  "cape town", "sea point", "green point", "mouille point", "bantry bay", "clifton",
  "camps bay", "bakoven", "llandudno", "hout bay", "noordhoek", "kommetjie", "scarborough",
  "simons town", "glencairn", "fish hoek", "kalk bay", "st james", "muizenberg",
  "strandfontein", "mitchells plain", "khayelitsha", "macassar", "gordons bay", "strand",
  "somerset west", "milnerton", "table view", "bloubergstrand", "blouberg", "big bay",
  "sunset beach", "melkbosstrand", "atlantis", "paarden eiland", "woodstock",
  // Western Cape: West Coast
  "yzerfontein", "darling", "langebaan", "saldanha", "vredenburg", "paternoster",
  "st helena bay", "velddrif", "laaiplek", "port owen", "elands bay", "lamberts bay",
  "doringbaai", "strandfontein wc", "vredendal",
  // Western Cape: Overberg
  "kleinmond", "betty's bay", "bettys bay", "pringle bay", "rooi els", "hermanus",
  "onrus", "vermont", "sandbaai", "stanford", "gansbaai", "de kelders", "pearly beach",
  "struisbaai", "l'agulhas", "agulhas", "bredasdorp", "arniston", "waenhuiskrans",
  "witsand", "infanta",
  // Western Cape: Garden Route
  "still bay", "stilbaai", "jongensfontein", "gouritsmond", "mossel bay", "hartenbos",
  "klein brak river", "groot brak river", "glentana", "george", "victoria bay",
  "wilderness", "sedgefield", "knysna", "brenton on sea", "buffalo bay", "plettenberg bay",
  "keurboomstrand", "natures valley", "nature's valley",
  // Eastern Cape
  "storms river", "tsitsikamma", "oyster bay", "cape st francis", "st francis bay",
  "jeffreys bay", "humansdorp", "gqeberha", "port elizabeth", "summerstrand", "humewood",
  "bluewater bay", "swartkops", "colchester", "alexandria", "kenton on sea",
  "boesmansriviermond", "bushmans river mouth", "port alfred", "kleinemonde", "hamburg",
  "east london", "gonubie", "beacon bay", "nahoon", "kidds beach", "cintsa", "chintsa",
  "haga haga", "morgan bay", "kei mouth", "mazeppa bay", "coffee bay", "hole in the wall",
  "port st johns", "mbotyi",
  // KwaZulu-Natal: South Coast
  "port edward", "southbroom", "marina beach", "ramsgate", "margate", "uvongo",
  "shelly beach", "st michaels on sea", "port shepstone", "hibberdene", "umzumbe",
  "pennington", "scottburgh", "umkomaas", "amanzimtoti", "warner beach", "kingsburgh",
  "isipingo", "illovo beach",
  // KwaZulu-Natal: Durban and North Coast
  "durban", "bluff", "umbilo", "glenwood", "morningside", "umgeni", "durban north",
  "umhlanga", "umhlanga rocks", "la lucia", "umdloti", "tongaat", "ballito", "salt rock",
  "sheffield beach", "shakas rock", "zinkwazi", "blythedale", "mtunzini", "richards bay",
  "meerensee", "st lucia", "cape vidal", "sodwana bay", "kosi bay",
  // Northern Cape
  "port nolloth", "alexander bay", "kleinzee", "hondeklip bay", "mcdougalls bay",
]);

/** Lowercase, strip punctuation and collapse spaces, so "St Francis Bay",
    "st. francis bay" and "ST FRANCIS  BAY" all match one entry. */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Spaces and hyphens removed as well, so "Capetown" matches "Cape Town" and
    "Kenton on Sea" matches "Kenton-on-Sea". Real customers type both. */
function compact(value: string): string {
  return normalise(value).replace(/[\s-]/g, "");
}

/** The town list, indexed by its compact form, built once. */
const COASTAL_TOWNS_COMPACT = new Set([...COASTAL_TOWNS].map(compact));

/**
 * Place-name fragments that mean the sea in South African addresses. Only ever
 * consulted inside a coastal province, which is what makes them safe: "Bayswater"
 * in Bloemfontein or "Beachwood" in Gauteng can never reach this test.
 *
 * This is the layer that catches the long tail; there are thousands of coastal
 * suburbs and no list will ever hold them all, but a great many of them say so
 * in their name.
 */
const SEA_WORDS = [
  "beach", "strand", "bay", "baai", "on sea", "onsea", "lagoon", "harbour",
  "harbor", "marina", "seaside", "sea point", "surf", "pier", "waterfront",
  "kus", "rivermouth", "river mouth", "mond", "eiland", "island",
];

function namedForTheSea(value: string): boolean {
  const n = normalise(value);
  if (!n) return false;
  return SEA_WORDS.some((word) => n.includes(word));
}

/**
 * Classify a delivery address. Both the town and the suburb are checked,
 * customers often put the metro in "city" and the actual seaside suburb in
 * "suburb" ("Cape Town" / "Kommetjie"), and either one is enough.
 */
export function coastalRisk(address: AddressValues): CoastalRisk {
  const inCoastalProvince = COASTAL_PROVINCES.has(normalise(address.province));

  // A landlocked province cannot be coastal, whatever the town is called.
  if (!inCoastalProvince) return "inland";

  for (const field of [address.city, address.suburb]) {
    if (COASTAL_TOWNS.has(normalise(field))) return "coastal";
    if (COASTAL_TOWNS_COMPACT.has(compact(field))) return "coastal";
    if (namedForTheSea(field)) return "coastal";
  }

  // Right province, unfamiliar town. Not a guess we should act on alone,
  // the form asks the customer outright instead. See effectiveCoastalRisk().
  return "possibly-coastal";
}

/**
 * The classification that actually drives the quote, once the customer has
 * answered "is the site within 30 km of the sea?".
 *
 * Detection alone is not good enough to add a mandatory charge: no list of town
 * names is ever complete, and the first real address tested here, "Lagoon
 * Beach, Capetown": slipped through two of the three tiers above. The answer
 * to a direct question does not have that problem, so where the address is
 * merely suspicious the customer's own answer decides, and detection only
 * chooses what the question starts on.
 */
export function effectiveCoastalRisk(
  detected: CoastalRisk,
  nearSea: boolean | null,
): CoastalRisk {
  if (detected === "coastal") return "coastal";
  if (detected === "inland") return "inland";
  if (nearSea === true) return "coastal";
  if (nearSea === false) return "inland";
  return "possibly-coastal";
}

/** Whether the form must put the near-the-sea question to the customer. */
export function needsCoastalAnswer(detected: CoastalRisk): boolean {
  return detected === "possibly-coastal";
}

export const COASTAL_QUESTION = "Is the site within about 30 km of the sea?";

export const COASTAL_QUESTION_HELP =
  "Salt air corrodes standard steel cladding, so units going to the coast need the " +
  "corrosion-resistant exterior. We can't tell from the address alone, so please tell us. " +
  "getting this wrong means a unit that rusts within about five years.";

/**
 * Product slug → the option id that must be fitted on a coastal site.
 *
 * Both entries are the same physical product (metal carved board panels) sold
 * under a different name and a different pricing model on each line, which is
 * why this map exists rather than a single shared option id:
 *
 *   X-Folds           `metal-carved-board`   R9 900 flat
 *   Expandable Homes  `pu-wall-insulation`   R300/m² of floor area
 *
 * Those two lines are the only ones that offer the panel. The remaining
 * products have nothing equivalent to select, so for those the quote raises the
 * requirement in words and the office specifies it on the formal quotation.
 */
export const COASTAL_REQUIRED_OPTION: Record<string, string> = {
  "folding-homes": "metal-carved-board",
  "expandable-homes": "pu-wall-insulation",
};

export function coastalOptionFor(slug: string): string | undefined {
  return COASTAL_REQUIRED_OPTION[slug];
}

/** True when the risk level means the corrosion specification is not optional. */
export function isCoastal(risk: CoastalRisk): boolean {
  return risk === "coastal";
}

/* ------------------------------------------------------------------- copy
   Kept here, in one place, because this warning appears on screen, on the
   quotation, in the customer's email and in the office email. Four copies of a
   safety message that drift apart are worse than none, the customer starts
   noticing which version they were shown. */

export const COASTAL_HEADLINE = "Coastal site: corrosion protection required";

export const COASTAL_BODY =
  "Salt air corrodes standard steel cladding quickly: an unprotected unit near the sea can be " +
  "visibly rusting within about five years. On coastal sites the corrosion-resistant exterior is " +
  "part of the specification, not an optional extra. On the units that take metal carved board " +
  "panels we've added them to this quote automatically; for any other unit we'll confirm the " +
  "right coastal specification on your formal quotation.";

export const MAYBE_COASTAL_HEADLINE = "Is your site near the sea?";

export const MAYBE_COASTAL_BODY =
  "Your delivery address is in a coastal province. If the site is within roughly 30 km of the " +
  "sea, the corrosion-resistant exterior is required rather than optional, because salt air can rust an " +
  "unprotected unit within about five years. We'll confirm this with you when we quote your " +
  "delivery, so please mention it if you know the site is exposed.";

export function coastalHeadline(risk: CoastalRisk): string | null {
  if (risk === "coastal") return COASTAL_HEADLINE;
  if (risk === "possibly-coastal") return MAYBE_COASTAL_HEADLINE;
  return null;
}

export function coastalBody(risk: CoastalRisk): string | null {
  if (risk === "coastal") return COASTAL_BODY;
  if (risk === "possibly-coastal") return MAYBE_COASTAL_BODY;
  return null;
}
