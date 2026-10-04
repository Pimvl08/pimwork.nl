import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows up to the limit inside the window, then blocks", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(limiter.check("a", 0).ok).toBe(true);
    expect(limiter.check("a", 10).ok).toBe(true);
    expect(limiter.check("a", 20).remaining).toBe(0);
    const blocked = limiter.check("a", 30);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBe(970);
  });

  it("frees capacity once old hits leave the window", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 100 });
    expect(limiter.check("a", 0).ok).toBe(true);
    expect(limiter.check("a", 50).ok).toBe(false);
    expect(limiter.check("a", 101).ok).toBe(true);
  });

  it("keeps keys independent and bounded", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 5 });
    for (let i = 0; i < 50; i++) expect(limiter.check(`k${i}`, i).ok).toBe(true);
    expect(limiter.check("k49", 60).ok).toBe(false);
  });
});
