import type { Env } from "./form-state";

/** GA4 measurement IDs look like `G-XXXXXXXXXX`. */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

/**
 * Google Analytics 4 measurement ID from `GA_MEASUREMENT_ID`, read at request time.
 * Null when unset or malformed: no GA code, no Google request and no analytics consent category.
 */
export function getGaMeasurementId(env: Env = process.env): string | null {
  const id = env.GA_MEASUREMENT_ID?.trim().toUpperCase();
  if (!id) return null;
  if (!GA_ID_PATTERN.test(id)) {
    console.warn(`[analytics] Ignoring GA_MEASUREMENT_ID "${id}": expected G-XXXXXXXXXX.`);
    return null;
  }
  return id;
}
