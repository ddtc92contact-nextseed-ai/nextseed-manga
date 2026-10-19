/**
 * Cookie consent: the visitor's choice, stored in localStorage for 6 months (CNIL guidance),
 * and a tiny external store the banner, the footer link and the analytics loader share.
 * Pure TypeScript (no DOM, no React) so it can be unit-tested; see consent-client.ts for the
 * browser instance.
 */

export const CONSENT_STORAGE_KEY = "nextseed:consent";
/** Bump when the categories change: older choices are then asked again. */
export const CONSENT_VERSION = 1;
/** How long a choice (accept or refuse) is remembered before the banner asks again. */
export const CONSENT_DURATION_MONTHS = 6;

export type Consent = {
  /** Audience measurement (Google Analytics 4). */
  analytics: boolean;
  /** When the choice was made (ms since epoch). */
  date: number;
};

/** "banner": first-visit banner; "preferences": detailed panel; "none": nothing shown. */
export type ConsentView = "none" | "banner" | "preferences";

export type ConsentSnapshot = {
  /** False on the server and until the stored choice has been read in the browser. */
  ready: boolean;
  consent: Consent | null;
  view: ConsentView;
};

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Date at which a choice made at `date` expires (same day, 6 months later). */
export function consentExpiry(date: number): number {
  const expiry = new Date(date);
  expiry.setUTCMonth(expiry.getUTCMonth() + CONSENT_DURATION_MONTHS);
  return expiry.getTime();
}

export function serializeConsent(consent: Consent): string {
  return JSON.stringify({ v: CONSENT_VERSION, analytics: consent.analytics, date: consent.date });
}

/** The stored choice, or null when missing, malformed, from another version, or expired. */
export function parseConsent(raw: string | null | undefined, now: number): Consent | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { v, analytics, date } = data as Record<string, unknown>;
    if (v !== CONSENT_VERSION || typeof analytics !== "boolean") return null;
    if (typeof date !== "number" || !Number.isFinite(date) || date > now) return null;
    if (now >= consentExpiry(date)) return null;
    return { analytics, date };
  } catch {
    return null;
  }
}

/** Google Analytics may run only with a measurement ID *and* the visitor's explicit consent. */
export function analyticsAllowed(gaId: string | null | undefined, consent: Consent | null): boolean {
  return Boolean(gaId) && consent?.analytics === true;
}

export type ConsentStore = ReturnType<typeof createConsentStore>;

export function createConsentStore({
  getStorage,
  now = Date.now,
}: {
  /** Lazily resolved: null (or throwing) when storage is unavailable, e.g. on the server. */
  getStorage: () => KeyValueStorage | null;
  now?: () => number;
}) {
  const serverSnapshot: ConsentSnapshot = { ready: false, consent: null, view: "none" };
  let snapshot = serverSnapshot;
  /** Whether there is anything optional to consent to (no GA ID → no banner). */
  let hasOptionalCategories = false;
  const listeners = new Set<() => void>();

  const set = (next: Partial<ConsentSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener());
  };

  const storage = () => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };

  const persist = (analytics: boolean) => {
    const consent = { analytics, date: now() };
    try {
      storage()?.setItem(CONSENT_STORAGE_KEY, serializeConsent(consent));
    } catch {
      // Storage blocked (private mode...): the choice still applies for this visit.
    }
    set({ consent, view: "none" });
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,

    /** Reads the stored choice (dropping an expired one) and shows the banner if needed. */
    init(options: { hasOptionalCategories: boolean }) {
      hasOptionalCategories = options.hasOptionalCategories;
      let raw: string | null = null;
      try {
        raw = storage()?.getItem(CONSENT_STORAGE_KEY) ?? null;
      } catch {
        raw = null;
      }
      const consent = parseConsent(raw, now());
      if (!consent && raw !== null) {
        try {
          storage()?.removeItem(CONSENT_STORAGE_KEY);
        } catch {
          // Nothing to clean up if storage is unavailable.
        }
      }
      const view: ConsentView =
        snapshot.view === "preferences" ? "preferences" : !consent && hasOptionalCategories ? "banner" : "none";
      set({ ready: true, consent, view });
    },

    acceptAll: () => persist(true),
    refuseAll: () => persist(false),
    /** Saves the detailed choices of the preferences panel. */
    save: (choices: { analytics: boolean }) => persist(choices.analytics),

    /** Reopens the detailed panel (footer link, /cookies page). */
    openPreferences: () => set({ view: "preferences" }),

    /**
     * Closes the banner or panel without an explicit choice: with no previous choice this counts
     * as a refusal (CNIL); otherwise the previous choice is kept.
     */
    dismiss() {
      if (!snapshot.consent && hasOptionalCategories) persist(false);
      else set({ view: "none" });
    },
  };
}
