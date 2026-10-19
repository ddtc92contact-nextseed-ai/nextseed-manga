import { describe, expect, it, vi } from "vitest";

import { getGaMeasurementId } from "@/server/analytics";

import { cookieDomains, gaCookieDeletions, gaCookieNames } from "./cookies";
import {
  analyticsAllowed,
  CONSENT_STORAGE_KEY,
  consentExpiry,
  createConsentStore,
  type KeyValueStorage,
  parseConsent,
  serializeConsent,
} from "./store";

const T0 = Date.UTC(2026, 0, 15, 12);

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function setup({ stored, now = T0, hasOptionalCategories = true }: { stored?: string; now?: number; hasOptionalCategories?: boolean } = {}) {
  const storage = memoryStorage(stored ? { [CONSENT_STORAGE_KEY]: stored } : {});
  let clock = now;
  const store = createConsentStore({ getStorage: () => storage, now: () => clock });
  store.init({ hasOptionalCategories });
  return { storage, store, setNow: (t: number) => (clock = t) };
}

describe("consent storage", () => {
  it("shows the banner on a first visit, and nothing is allowed yet", () => {
    const { store } = setup();
    expect(store.getSnapshot()).toEqual({ ready: true, consent: null, view: "banner" });
    expect(analyticsAllowed("G-TEST1234", store.getSnapshot().consent)).toBe(false);
  });

  it("is not ready (and shows nothing) before init, as on the server", () => {
    const store = createConsentStore({ getStorage: () => null });
    expect(store.getSnapshot()).toEqual({ ready: false, consent: null, view: "none" });
    expect(store.getServerSnapshot()).toBe(store.getSnapshot());
  });

  it("accept all: stores the choice with its date and hides the banner", () => {
    const { store, storage } = setup();
    const listener = vi.fn();
    store.subscribe(listener);
    store.acceptAll();
    expect(listener).toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: true, date: T0 }, view: "none" });
    expect(parseConsent(storage.data.get(CONSENT_STORAGE_KEY), T0)).toEqual({ analytics: true, date: T0 });
  });

  it("refuse all: stores the refusal, which is remembered on the next visit", () => {
    const { store, storage } = setup();
    store.refuseAll();
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: false }, view: "none" });

    const next = setup({ stored: storage.data.get(CONSENT_STORAGE_KEY), now: T0 + 86_400_000 });
    expect(next.store.getSnapshot()).toMatchObject({ consent: { analytics: false }, view: "none" });
  });

  it("closing the banner without a choice counts as a refusal", () => {
    const { store, storage } = setup();
    store.dismiss();
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: false }, view: "none" });
    expect(storage.data.has(CONSENT_STORAGE_KEY)).toBe(true);
  });

  it("keeps the choice for 6 months, then asks again", () => {
    const stored = serializeConsent({ analytics: true, date: T0 });
    const justBefore = consentExpiry(T0) - 1;
    expect(new Date(consentExpiry(T0)).toISOString()).toBe("2026-07-15T12:00:00.000Z");

    expect(setup({ stored, now: justBefore }).store.getSnapshot()).toMatchObject({
      consent: { analytics: true },
      view: "none",
    });

    const expired = setup({ stored, now: consentExpiry(T0) });
    expect(expired.store.getSnapshot()).toMatchObject({ consent: null, view: "banner" });
    expect(expired.storage.data.has(CONSENT_STORAGE_KEY)).toBe(false);
  });

  it("reopening shows the preferences with the current choice, which can be changed", () => {
    const { store } = setup({ stored: serializeConsent({ analytics: true, date: T0 }) });
    store.openPreferences();
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: true }, view: "preferences" });

    // Closing the reopened panel keeps the previous choice.
    store.dismiss();
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: true }, view: "none" });

    store.openPreferences();
    store.save({ analytics: false });
    expect(store.getSnapshot()).toMatchObject({ consent: { analytics: false }, view: "none" });
  });

  it("ignores malformed, future-dated or other-version values", () => {
    expect(parseConsent("not json", T0)).toBeNull();
    expect(parseConsent(JSON.stringify({ v: 1, analytics: "yes", date: T0 }), T0)).toBeNull();
    expect(parseConsent(JSON.stringify({ v: 99, analytics: true, date: T0 }), T0)).toBeNull();
    expect(parseConsent(JSON.stringify({ v: 1, analytics: true, date: T0 + 1 }), T0)).toBeNull();
    expect(parseConsent(null, T0)).toBeNull();
  });

  it("still works for the current visit when storage is blocked", () => {
    const store = createConsentStore({
      getStorage: () => {
        throw new Error("SecurityError");
      },
      now: () => T0,
    });
    store.init({ hasOptionalCategories: true });
    expect(store.getSnapshot().view).toBe("banner");
    store.acceptAll();
    expect(store.getSnapshot().consent).toEqual({ analytics: true, date: T0 });
  });

  it("shows no banner when there is nothing optional to consent to (no GA ID)", () => {
    const { store, storage } = setup({ hasOptionalCategories: false });
    expect(store.getSnapshot()).toMatchObject({ consent: null, view: "none" });
    // The panel can still be opened from the footer, and closing it stores nothing.
    store.openPreferences();
    store.dismiss();
    expect(store.getSnapshot().view).toBe("none");
    expect(storage.data.size).toBe(0);
  });
});

describe("no Google Analytics without consent or without ID", () => {
  const accepted = { analytics: true, date: T0 };
  const refused = { analytics: false, date: T0 };

  it("needs both a measurement ID and an explicit acceptance", () => {
    expect(analyticsAllowed("G-TEST1234", accepted)).toBe(true);
    expect(analyticsAllowed("G-TEST1234", refused)).toBe(false);
    expect(analyticsAllowed("G-TEST1234", null)).toBe(false);
    expect(analyticsAllowed(null, accepted)).toBe(false);
    expect(analyticsAllowed("", accepted)).toBe(false);
  });

  it("reads GA_MEASUREMENT_ID, and ignores a missing or malformed one", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getGaMeasurementId({ GA_MEASUREMENT_ID: " g-abc123xyz " })).toBe("G-ABC123XYZ");
    expect(getGaMeasurementId({})).toBeNull();
    expect(getGaMeasurementId({ GA_MEASUREMENT_ID: "" })).toBeNull();
    expect(getGaMeasurementId({ GA_MEASUREMENT_ID: "UA-12345-1" })).toBeNull();
    expect(getGaMeasurementId({ GA_MEASUREMENT_ID: "G-<script>" })).toBeNull();
  });
});

describe("Google Analytics cookie removal", () => {
  it("finds _ga, _ga_<id> and legacy GA cookies only", () => {
    expect(gaCookieNames("_ga=GA1.1.1; theme=dark; _ga_ABC123=GS1.1; _gid=x; _gat_UA=1; _gallery=1")).toEqual([
      "_ga",
      "_ga_ABC123",
      "_gid",
      "_gat_UA",
    ]);
    expect(gaCookieNames("")).toEqual([]);
  });

  it("tries the host and every parent domain (GA writes on the widest one)", () => {
    expect(cookieDomains("manga.example.com")).toEqual([
      undefined,
      "manga.example.com",
      ".manga.example.com",
      "example.com",
      ".example.com",
    ]);
    expect(cookieDomains("localhost")).toEqual([undefined]);
    expect(cookieDomains("127.0.0.1")).toEqual([undefined]);
  });

  it("builds expiring assignments for each cookie and domain", () => {
    const deletions = gaCookieDeletions("_ga=1; other=2", "example.com");
    expect(deletions).toHaveLength(3);
    expect(deletions.every((d) => d.startsWith("_ga=; Max-Age=0;") && d.includes("Path=/"))).toBe(true);
    expect(deletions[2]).toMatch(/Domain=\.example\.com$/);
  });
});
