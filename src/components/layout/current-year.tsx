"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The copyright year in the footer.
 *
 * Pages are built ahead of time, so the server's year is the year of the last
 * build. Once the page is in the browser this swaps in the visitor's current
 * year, so the footer does not show last year after 1 January when no deploy
 * has happened since. The server snapshot keeps hydration identical to the
 * HTML that was sent.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );
  return <>{year}</>;
}
