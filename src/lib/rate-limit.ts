/**
 * Sliding-window rate limiter kept in memory.
 *
 * Limitation (documented in SECURITY.md): on serverless hosting every warm
 * instance has its own memory, so the limit is per instance. The interface is
 * small on purpose so it can be swapped for a shared store (Redis, Upstash)
 * without touching the routes.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Milliseconds until the next request is allowed (0 when ok). */
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
  reset(): void;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [key, stamps] of hits) {
      const fresh = stamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
    // Hard cap so a flood of unique keys cannot grow memory without bound.
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  };

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      if (hits.size > maxKeys) prune(now);
      const stamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (stamps.length >= limit) {
        hits.set(key, stamps);
        return { ok: false, remaining: 0, retryAfterMs: windowMs - (now - stamps[0]) };
      }
      stamps.push(now);
      hits.set(key, stamps);
      return { ok: true, remaining: limit - stamps.length, retryAfterMs: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}
