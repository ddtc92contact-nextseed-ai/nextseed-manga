import { describe, expect, it } from "vitest";

import { clientIp, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows `limit` hits per window, per key", () => {
    let t = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect([limiter.check("a"), limiter.check("a"), limiter.check("a")]).toEqual([true, true, false]);
    expect(limiter.check("b")).toBe(true);
    t = 1000;
    expect(limiter.check("a")).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers the first X-Forwarded-For address", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" }))).toBe("203.0.113.4");
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.5" }))).toBe("203.0.113.5");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
