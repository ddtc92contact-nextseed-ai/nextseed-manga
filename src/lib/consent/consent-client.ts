"use client";

import { useSyncExternalStore } from "react";

import { createConsentStore } from "./store";

/** The browser's consent store, shared by the banner, the footer link and the /cookies page. */
export const consentStore = createConsentStore({
  getStorage: () => (typeof window === "undefined" ? null : window.localStorage),
});

export function useConsent() {
  return useSyncExternalStore(consentStore.subscribe, consentStore.getSnapshot, consentStore.getServerSnapshot);
}
