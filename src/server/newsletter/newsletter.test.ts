import { describe, expect, it, vi } from "vitest";

import { createRateLimiter } from "../rate-limit";
import { BREVO_CONTACTS_URL, createBrevoProvider } from "./brevo";
import { getNewsletterProvider, handleNewsletterSignup, type NewsletterProvider } from "./index";

function form(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

const limiter = () => createRateLimiter({ limit: 5, windowMs: 60_000 });

describe("getNewsletterProvider", () => {
  it("is null without (valid) Brevo config, so the signup stays hidden", () => {
    expect(getNewsletterProvider({})).toBeNull();
    expect(getNewsletterProvider({ BREVO_API_KEY: "key" })).toBeNull();
    expect(getNewsletterProvider({ BREVO_API_KEY: "key", BREVO_LIST_ID: "abc" })).toBeNull();
  });

  it("returns the Brevo adapter when configured", () => {
    expect(getNewsletterProvider({ BREVO_API_KEY: "key", BREVO_LIST_ID: "3" })?.name).toBe("brevo");
  });
});

describe("Brevo adapter", () => {
  it("upserts the contact into the configured list", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    await createBrevoProvider({ apiKey: "xkeysib-test", listId: 7, fetchImpl }).subscribe("a@b.test");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(BREVO_CONTACTS_URL);
    expect(init.method).toBe("POST");
    expect(init.headers["api-key"]).toBe("xkeysib-test");
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.test", listIds: [7], updateEnabled: true });
  });

  it("throws on an API error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{"code":"unauthorized"}', { status: 401 }));
    await expect(
      createBrevoProvider({ apiKey: "bad", listId: 7, fetchImpl }).subscribe("a@b.test"),
    ).rejects.toThrow(/401/);
  });
});

describe("handleNewsletterSignup", () => {
  const okProvider = (): NewsletterProvider & { subscribe: ReturnType<typeof vi.fn> } => ({
    name: "mock",
    subscribe: vi.fn().mockResolvedValue(undefined),
  });

  it("subscribes a valid email", async () => {
    const provider = okProvider();
    const state = await handleNewsletterSignup(form("  fan@example.com "), { ip: "1", provider, limiter: limiter() });
    expect(state.status).toBe("success");
    expect(provider.subscribe).toHaveBeenCalledWith("fan@example.com");
  });

  it("returns a field error for an invalid email", async () => {
    const provider = okProvider();
    const state = await handleNewsletterSignup(form("not-an-email"), { ip: "1", provider, limiter: limiter() });
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.email?.[0]).toBeTruthy();
    expect(provider.subscribe).not.toHaveBeenCalled();
  });

  it("returns an error state when the provider fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = { name: "mock", subscribe: vi.fn().mockRejectedValue(new Error("down")) };
    const state = await handleNewsletterSignup(form("fan@example.com"), { ip: "1", provider, limiter: limiter() });
    expect(state.status).toBe("error");
    expect(state.values).toEqual({ email: "fan@example.com" });
  });

  it("rate-limits per IP", async () => {
    const provider = okProvider();
    const deps = { provider, limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) };
    expect((await handleNewsletterSignup(form("a@b.test"), { ...deps, ip: "1" })).status).toBe("success");
    expect((await handleNewsletterSignup(form("a@b.test"), { ...deps, ip: "1" })).status).toBe("error");
  });

  it("errors without a provider", async () => {
    const state = await handleNewsletterSignup(form("a@b.test"), { ip: "1", provider: null, limiter: limiter() });
    expect(state.status).toBe("error");
  });
});
