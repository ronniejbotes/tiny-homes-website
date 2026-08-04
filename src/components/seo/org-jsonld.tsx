import { JsonLd, localBusinessSchema, organizationSchema } from "@/lib/schema";

/**
 * Sitewide identity JSON-LD.
 *
 * Two separate <script> tags rather than one array-valued node: parsers that
 * scan the raw HTML for `"@type":"Organization"` or `"@type":"LocalBusiness"`
 * match a single-typed object far more reliably than an array, and several
 * (including common SEO auditors) miss the array form entirely.
 *
 * Server component: intended to be slotted into the root layout.
 */
export function OrgJsonLd() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
    </>
  );
}
