"use client";

import type { ReactNode } from "react";

import { consentStore } from "@/lib/consent/consent-client";

/** Reopens the cookie preferences panel (footer, /cookies page). */
export function CookieSettingsButton({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => consentStore.openPreferences()} className={className}>
      {children}
    </button>
  );
}
