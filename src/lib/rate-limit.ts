/**
 * Per-IP throttling for the routes that spend something real: a mailbox with a
 * 100-sends-per-day ceiling, and the owner's diary.
 *
 * In-memory is the right size for this. The site runs as a single Node process
 * on Hostinger, so one map is the whole picture, and a counter that resets on
 * deploy is no loss — the thing being protected is a daily quota, not a
 * security boundary.
 *
 * Server-only.
 */

interface Bucket {
  windowMs: number;
  max: number;
  hits: Map<string, number[]>;
}

const buckets = new Map<string, Bucket>();

function bucketFor(name: string, windowMs: number, max: number): Bucket {
  const bucket = buckets.get(name);
  if (!bucket) {
    const created = { windowMs, max, hits: new Map<string, number[]>() };
    buckets.set(name, created);
    return created;
  }
  // Re-applied rather than fixed at creation, so the limits a caller passes are
  // always the limits in force. Otherwise editing them here would appear to do
  // nothing until the process restarted.
  bucket.windowMs = windowMs;
  bucket.max = max;
  return bucket;
}

/**
 * Record a hit and report whether this caller has had too many.
 *
 * Named buckets keep the flows independent: someone who has just built three
 * quotes should still be able to book a viewing.
 */
export function rateLimited(
  name: string,
  ip: string,
  options: { windowMs: number; max: number },
): boolean {
  const bucket = bucketFor(name, options.windowMs, options.max);
  const now = Date.now();

  const recent = (bucket.hits.get(ip) ?? []).filter((t) => now - t < bucket.windowMs);
  recent.push(now);
  bucket.hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (bucket.hits.size > 500) {
    for (const [key, times] of bucket.hits) {
      if (times.every((t) => now - t >= bucket.windowMs)) bucket.hits.delete(key);
    }
  }

  return recent.length > bucket.max;
}

/** Best-effort caller identity behind Hostinger's proxy. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Trim, collapse whitespace and cap length. Payloads are never trusted. */
export function str(value: unknown, max = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
