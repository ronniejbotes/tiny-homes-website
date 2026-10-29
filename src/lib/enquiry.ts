import { site } from "@/lib/site";

/**
 * The two email enquiries the site asks for, owner-instructed 29 October 2026.
 *
 * 1. Business and volume enquiries: "Our main target for tiny homes now is to
 *    deal with larger companies that will buy multiple units." Every
 *    "Business enquiry" button on the site goes to /contact#business, where
 *    this template is offered.
 * 2. Viewings: "If they want to view, they need to send an email and state why
 *    they are interested, what it will be used for, where it will be and how
 *    many potential units will be purchased." The online booker is gone; every
 *    viewing link goes to /contact#viewing, where this template is offered.
 *
 * Both are plain mailto links to `site.email` with a subject and a body that
 * carries the questions, so nothing is collected by the site itself (the
 * privacy page's "the contact page collects nothing" stays true). The address
 * is always printed beside the button too, for anyone whose device has no
 * email app set up.
 */

/** Where a "Business enquiry" button goes. */
export const BUSINESS_ENQUIRY_HREF = "/contact#business";
/** Where a "how to view a unit" link goes. */
export const VIEWING_HREF = "/contact#viewing";

/** The four things a business enquiry asks for, in the order the email lists them. */
export const BUSINESS_QUESTIONS = [
  "Your company name",
  "What the units will be used for",
  "Where they will go",
  "How many units you're looking at, and which range if you know",
] as const;

/** RFC 6068: line breaks in a mailto body are CRLF, percent-encoded. */
function mailto(subject: string, lines: string[]): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join("\r\n"),
  )}`;
}

/** Prefilled business enquiry: subject plus a line to fill in per question. */
export const businessEnquiryMailto = mailto("Business enquiry", [
  "Company name:",
  "",
  "What the units will be used for:",
  "",
  "Where they will go (town and province):",
  "",
  "How many units:",
  "",
  "Which range, if you know:",
  "",
  "Your name and phone number:",
  "",
]);

/** Prefilled viewing request, carrying the owner's four questions. */
export const viewingMailto = mailto("Request to view a unit", [
  "Why I'm interested:",
  "",
  "What the units will be used for:",
  "",
  "Where they will go (town and province):",
  "",
  "How many units I'm looking at:",
  "",
  "My name and phone number:",
  "",
]);
