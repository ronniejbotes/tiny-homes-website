import { JsonLd, organizationSchema } from "@/lib/schema";

/**
 * Sitewide Organization + LocalBusiness JSON-LD.
 * Server component — intended to be slotted into the root layout.
 */
export function OrgJsonLd() {
  return <JsonLd data={organizationSchema()} />;
}
