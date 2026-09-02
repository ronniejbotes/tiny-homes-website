import { Fragment } from "react";
import Link from "next/link";

/**
 * The blog's inline markup, rendered to React elements.
 *
 * Two constructs only: `[label](/path)` and `**bold**`. That is deliberately
 * less than Markdown. A full Markdown pipeline would mean a dependency (which
 * this project holds at arm's length — see CLAUDE.md on why a casual
 * dependency change here has already broken production twice) and a rendered
 * HTML string, which then has to be sanitised or trusted. This produces React
 * elements directly, so there is no `dangerouslySetInnerHTML` anywhere in the
 * blog and nothing to sanitise.
 *
 * Internal links go through next/link so they prefetch and client-navigate
 * like every other link on the site; anything not starting with "/" is
 * rendered as a plain anchor opened in a new tab, since it is leaving us.
 *
 * The patterns are held as SOURCE STRINGS and compiled per call, never as
 * shared /g RegExp objects. A global regex carries `lastIndex` between calls,
 * so a module-level one is mutable state shared by every render: two
 * components matching against it interleave and each silently skips part of
 * its own text. Compiling per call costs nothing measurable and makes the
 * function genuinely pure.
 */

const LINK_SRC = String.raw`\[([^\]]+)\]\(([^)]+)\)`;
const BOLD_SRC = String.raw`\*\*([^*]+)\*\*`;

const linkRe = () => new RegExp(LINK_SRC, "g");
const boldRe = () => new RegExp(BOLD_SRC, "g");

/** Splits a link-free run on `**bold**`. */
function withBold(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = boldRe();
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <strong key={`${keyPrefix}-b${match.index}`} className="font-medium text-ink">
        {match[1]}
      </strong>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const linkClass =
  "font-medium text-clay underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay-dark hover:decoration-clay";

export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  const re = linkRe();
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(
        <Fragment key={`t${last}`}>
          {withBold(text.slice(last, match.index), `t${last}`)}
        </Fragment>,
      );
    }
    const [, label, href] = match;
    nodes.push(
      href.startsWith("/") ? (
        <Link key={`l${match.index}`} href={href} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a
          key={`l${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {label}
        </a>
      ),
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(<Fragment key={`t${last}`}>{withBold(text.slice(last), `t${last}`)}</Fragment>);
  }

  return <>{nodes}</>;
}

/**
 * The same markup flattened to plain text, for meta descriptions and JSON-LD.
 *
 * Structured data must carry the words a reader sees, not the authoring
 * syntax: a FAQ answer serialised with `**bold**` and `[label](/path)` still
 * in it is what gets read aloud by an assistant and shown in a rich result.
 */
export function toPlainText(text: string): string {
  return text.replace(linkRe(), "$1").replace(boldRe(), "$1");
}
