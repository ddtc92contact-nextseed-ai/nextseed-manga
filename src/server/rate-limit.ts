/**
 * Minimal in-memory fixed-window rate limiter, keyed by client IP.
 *
 * The site runs as a single Node process on the VPS, so process memory is enough; if it ever
 * runs on several instances, swap this for a shared store (Redis...).
 */
export type RateLimiter = {
  /** Records a hit for `key`; returns false when the key is over its limit. */
  check: (key: string) => boolean;
};

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key) {
      const t = now();
      // Opportunistic cleanup so the map can't grow without bound.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      }
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
  };
}

/** Best-effort client IP from proxy headers (the VPS sits behind Traefik). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
