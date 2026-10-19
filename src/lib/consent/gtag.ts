/**
 * Google Analytics 4 (gtag.js) with Google Consent Mode v2, loaded only after consent.
 *
 * - Nothing here runs, and nothing is requested from Google, until `enableAnalytics()` is called,
 *   which only happens once the visitor has accepted the "analytics" category.
 * - Every consent type defaults to `denied`; accepting grants `analytics_storage` only
 *   (ads storage, ad_user_data and ad_personalization stay denied).
 * - Data minimisation: no Google signals, no ad personalisation, URLs sent without query string
 *   or hash, cookies kept 13 months at most and not refreshed on each visit (CNIL guidance).
 *   GA4 never logs or stores IP addresses.
 * - Page views are sent by hand on every App Router navigation (`trackPageView`).
 */

import { gaCookieDeletions } from "./cookies";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const SCRIPT_ID = "ga4-gtag";
/** 13 months, the CNIL maximum lifetime for an audience-measurement cookie. */
const COOKIE_EXPIRES_SECONDS = 13 * 30 * 24 * 60 * 60;

/** Measurement ID currently allowed to send hits (null: analytics off). */
let activeId: string | null = null;
let configured = false;
/** Whether the consent state is known yet (the consent manager hydrates after the page). */
let decided = false;
/** Events fired before the consent state was known, sent only if analytics gets enabled. */
let pending: [string, Record<string, string | number | boolean>][] = [];

/** Defines `gtag()` (a dataLayer queue, no network) with every consent type denied. */
function ensureGtag(): Gtag {
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag.js expects the `arguments` object itself, not an array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
    });
    window.gtag("set", "ads_data_redaction", true);
  }
  return window.gtag;
}

/** The current page URL without query string or hash. */
function pageLocation() {
  return `${window.location.origin}${window.location.pathname}`;
}

/** Grants analytics storage and loads gtag.js (once). Call only after the visitor's consent. */
export function enableAnalytics(measurementId: string) {
  const gtag = ensureGtag();
  (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = false;
  gtag("consent", "update", { analytics_storage: "granted" });

  if (!configured) {
    configured = true;
    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: COOKIE_EXPIRES_SECONDS,
      cookie_update: false,
      page_location: pageLocation(),
    });
  }

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
  activeId = measurementId;
  decided = true;
  for (const [name, params] of pending) gtag("event", name, params);
  pending = [];
}

/**
 * Stops all tracking (consent withdrawn or never given) and deletes the `_ga*` cookies.
 * Safe to call when analytics never ran: it then only cleans up leftover cookies.
 */
export function disableAnalytics(measurementId: string) {
  activeId = null;
  decided = true;
  pending = [];
  if (window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true;
  }
  for (const deletion of gaCookieDeletions(document.cookie, window.location.hostname)) {
    document.cookie = deletion;
  }
}

/** Sends a page_view for the current URL (no-op without consent). */
export function trackPageView() {
  if (!activeId || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_location: pageLocation(),
    page_title: document.title,
  });
}

/**
 * Sends a custom event (no-op without consent). Never pass personal data here: no email,
 * no form content, nothing typed by the visitor.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (!decided) {
    if (pending.length < 10) pending.push([name, params]);
    return;
  }
  if (!activeId || !window.gtag) return;
  window.gtag("event", name, params);
}
