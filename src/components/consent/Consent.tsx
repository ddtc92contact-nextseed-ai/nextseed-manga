import { connection } from "next/server";

import { getGaMeasurementId } from "@/server/analytics";

import { ConsentManager } from "./ConsentManager";

/**
 * Consent banner + Google Analytics, configured at request time from GA_MEASUREMENT_ID
 * (changing it only needs a restart). Wrap it in <Suspense>.
 */
export async function Consent() {
  await connection();
  return <ConsentManager gaId={getGaMeasurementId()} />;
}
