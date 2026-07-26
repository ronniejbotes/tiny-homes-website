"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Phone, RotateCw, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const whatsappHref = `${site.whatsapp}?text=${encodeURIComponent(
  "Hi Tiny Homes SA! The website showed an error — can you help me?",
)}`;

/**
 * Route-segment error boundary. Next 16.2 hands this component `unstable_retry`
 * alongside the older `reset`: retry refreshes the router *and* clears the
 * boundary, so the failed server segment is actually re-fetched, whereas `reset`
 * only re-renders the same broken payload. The `unstable_` prefix is the API's
 * real name in 16.2.x — rename here when it stabilises.
 */
export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Puts the digest in the Node process logs, so "the site broke" reports can
    // be matched to the exact server-side stack on the host.
    console.error(error);
  }, [error]);

  return (
    <div className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <Container className="max-w-3xl">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-clay-dark"
          aria-hidden="true"
        >
          <TriangleAlert className="h-6 w-6" />
        </span>
        <p className="text-eyebrow mt-6 text-clay">Something went wrong</p>
        <h1 className="text-display mt-4 text-4xl text-ink sm:text-5xl">
          This page didn&apos;t load
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone">
          A hiccup on our side stopped this page from loading — it&apos;s almost always
          temporary. Try again, and if it keeps happening, call or WhatsApp us and
          we&apos;ll answer anything you wanted to know here.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => unstable_retry()} variant="primary" size="lg">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Back to the homepage
          </ButtonLink>
          <ButtonAnchor
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
            Chat on WhatsApp
          </ButtonAnchor>
          <ButtonAnchor
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            variant="outline"
            size="lg"
          >
            <Phone className="h-4 w-4 text-clay" aria-hidden="true" />
            {site.phoneDisplay}
          </ButtonAnchor>
        </div>

        {/* The digest is the only handle support has on a production error —
            server messages are stripped before they reach the browser. */}
        {error.digest && (
          <p className="mt-10 border-t border-border pt-6 text-sm text-stone">
            Quote this reference if you contact us:{" "}
            <span className="nums-tabular font-medium text-ink">{error.digest}</span>
          </p>
        )}
      </Container>
    </div>
  );
}
