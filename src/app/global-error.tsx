"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { site } from "@/lib/site";

/* global-error replaces the root layout, so neither globals.css nor the
   next/font CSS variables set on <html> are guaranteed to be applied when this
   renders. Every style here is therefore inline and self-contained, the one
   page that must never itself fail to render. Values mirror the @theme palette
   in globals.css (cream / ink / stone / clay / border). */
const palette = {
  cream: "#faf6ef",
  parchment: "#f4eee2",
  ink: "#1c1b17",
  stone: "#67635a",
  clay: "#b4552d",
  clayDark: "#9a4522",
  border: "#ddd3c1",
} as const;

const sans = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const serif = 'ui-serif, Georgia, "Times New Roman", serif';

const styles = {
  body: {
    margin: 0,
    background: palette.cream,
    color: palette.ink,
    fontFamily: sans,
    WebkitFontSmoothing: "antialiased",
  },
  main: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 1.25rem",
  },
  card: { width: "100%", maxWidth: "34rem" },
  eyebrow: {
    margin: 0,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: palette.clay,
  },
  heading: {
    margin: "1rem 0 0",
    fontFamily: serif,
    fontWeight: 560,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
    fontSize: "clamp(2rem, 6vw, 3rem)",
  },
  copy: {
    margin: "1.5rem 0 0",
    fontSize: "1.0625rem",
    lineHeight: 1.65,
    color: palette.stone,
  },
  actions: {
    margin: "2.25rem 0 0",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  buttonBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "3.25rem",
    padding: "0 2rem",
    borderRadius: "9999px",
    fontFamily: "inherit",
    fontSize: "1rem",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
  },
  digest: {
    margin: "2.5rem 0 0",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${palette.border}`,
    fontSize: "0.875rem",
    color: palette.stone,
  },
} satisfies Record<string, React.CSSProperties>;

const primaryButton: React.CSSProperties = {
  ...styles.buttonBase,
  background: palette.clay,
  color: palette.cream,
  border: `1px solid ${palette.clay}`,
};

const secondaryButton: React.CSSProperties = {
  ...styles.buttonBase,
  background: palette.parchment,
  color: palette.ink,
  border: `1px solid ${palette.border}`,
};

/**
 * Last-resort boundary for errors thrown by the root layout itself (navbar,
 * footer, fonts): error.tsx cannot catch those, and without this the visitor
 * gets Next's unbranded fallback with no way to reach us. Metadata exports are
 * not supported here (it's a Client Component), so the tab title is set with
 * React's <title>, per the Next 16 error.js docs.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html lang="en-ZA">
      <body style={styles.body}>
        <title>Something went wrong | Tiny Homes SA</title>
        <main style={styles.main}>
          <div style={styles.card}>
            <p style={styles.eyebrow}>Something went wrong</p>
            <h1 style={styles.heading}>The site didn&apos;t load</h1>
            <p style={styles.copy}>
              A problem on our side stopped this page from loading. It&apos;s almost always
              temporary. Please try again. If it keeps happening, call us on{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                style={{ color: palette.clayDark, fontWeight: 500 }}
              >
                {site.phoneDisplay}
              </a>{" "}
              or message us on WhatsApp and we&apos;ll help you straight away.
            </p>
            <div style={styles.actions}>
              <button type="button" onClick={() => unstable_retry()} style={primaryButton}>
                Try again
              </button>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                style={secondaryButton}
              >
                Chat on WhatsApp
              </a>
            </div>
            {error.digest && (
              <p style={styles.digest}>
                Quote this reference if you contact us:{" "}
                <span style={{ color: palette.ink, fontWeight: 500 }}>{error.digest}</span>
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
