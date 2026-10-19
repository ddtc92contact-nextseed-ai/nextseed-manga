"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { consentStore, useConsent } from "@/lib/consent/consent-client";
import { disableAnalytics, enableAnalytics, trackPageView } from "@/lib/consent/gtag";
import { analyticsAllowed, type Consent } from "@/lib/consent/store";

import { Button } from "../Button";

/**
 * Cookie consent banner + preferences panel, and the Google Analytics loader it gates.
 * Rendered once in the root layout with the GA4 measurement ID (null when not configured: no
 * banner, since nothing optional is used, and never any Google request).
 *
 * The panel is a non-modal dialog fixed at the bottom of the screen: the page stays usable, so
 * there is no focus trap. Escape or the close button without a choice counts as a refusal.
 */
export function ConsentManager({ gaId }: { gaId: string | null }) {
  const { ready, consent, view } = useConsent();
  const pathname = usePathname();
  const allowed = analyticsAllowed(gaId, consent);

  useEffect(() => {
    consentStore.init({ hasOptionalCategories: Boolean(gaId) });
  }, [gaId]);

  // Load GA only after consent; stop it and delete its cookies as soon as consent is withdrawn.
  useEffect(() => {
    if (!gaId || !ready) return;
    if (allowed) enableAnalytics(gaId);
    else disableAnalytics(gaId);
  }, [gaId, ready, allowed]);

  // One page_view per App Router navigation (and for the page where consent was given).
  useEffect(() => {
    if (allowed) trackPageView();
  }, [allowed, pathname]);

  if (!ready || view === "none") return null;
  return <ConsentPanel key={view} view={view} consent={consent} hasAnalytics={Boolean(gaId)} />;
}

function ConsentPanel({
  view,
  consent,
  hasAnalytics,
}: {
  view: "banner" | "preferences";
  consent: Consent | null;
  hasAnalytics: boolean;
}) {
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [customising, setCustomising] = useState(view === "preferences");
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);

  // Escape closes the panel (a refusal if no choice was made yet).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") consentStore.dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // When opened on request (footer, /cookies), move the focus into the panel and give it back
  // to the opener on close. The first-visit banner doesn't steal the focus.
  useEffect(() => {
    if (view !== "preferences") return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    headingRef.current?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [view]);

  const customise = () => {
    setCustomising(true);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-text`}
      data-consent-panel={view}
      className="consent-panel fixed inset-x-0 bottom-0 z-[60] max-h-[85dvh] overflow-y-auto border-t-4 border-accent bg-ink-900 pb-[env(safe-area-inset-bottom)] text-paper shadow-[0_-8px_32px_rgb(0_0_0/0.6)]"
    >
      <div className="relative mx-auto w-full max-w-site px-gutter py-5 sm:py-6 lg:px-gutter-lg">
        <button
          type="button"
          onClick={() => consentStore.dismiss()}
          aria-label={consent || !hasAnalytics ? "Fermer" : "Fermer et continuer sans accepter"}
          className="absolute right-2 top-2 flex size-11 items-center justify-center text-2xl text-paper-muted transition-colors hover:text-accent sm:right-4"
        >
          <span aria-hidden="true">×</span>
        </button>

        <h2
          id={`${id}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="pr-10 font-display text-lg sm:text-xl"
        >
          {customising ? "Gérer mes cookies" : "Vos données, votre choix"}
        </h2>

        {!customising ? (
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <p id={`${id}-text`} className="max-w-3xl text-sm leading-relaxed text-paper-muted">
              Avec votre accord, nous mesurons l’audience du site avec Google Analytics pour savoir quels
              chapitres sont lus. Aucune publicité, aucun profilage. Vous pouvez changer d’avis à tout
              moment via «&nbsp;Gérer les cookies&nbsp;» en bas de page.{" "}
              <Link href="/cookies" className="text-paper underline underline-offset-4 hover:text-accent">
                En savoir plus
              </Link>
            </p>
            <div className="grid shrink-0 gap-3 sm:grid-cols-3">
              <Button variant="outline" onClick={() => consentStore.refuseAll()}>
                Tout refuser
              </Button>
              <Button variant="outline" onClick={() => consentStore.acceptAll()}>
                Tout accepter
              </Button>
              <Button variant="outline" onClick={customise}>
                Personnaliser
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="mt-2"
            onSubmit={(event) => {
              event.preventDefault();
              consentStore.save({ analytics });
            }}
          >
            <p id={`${id}-text`} className="max-w-3xl text-sm leading-relaxed text-paper-muted">
              {hasAnalytics
                ? "Choisissez les cookies que vous acceptez. Votre choix est conservé 6\u00a0mois et reste modifiable à tout moment."
                : "Voici ce que ce site enregistre dans votre navigateur."}{" "}
              <Link href="/cookies" className="text-paper underline underline-offset-4 hover:text-accent">
                Détail des cookies
              </Link>
            </p>

            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              <li className="border-2 border-ink-700 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">Strictement nécessaires</h3>
                  <span className="text-xs font-semibold uppercase tracking-widest text-paper-faint">
                    Toujours actifs
                  </span>
                </div>
                <p className="mt-2 text-sm text-paper-muted">
                  Mémorisent votre choix de cookies et vos préférences de lecture, dans votre navigateur
                  uniquement. Ils ne servent à aucun suivi.
                </p>
              </li>
              {hasAnalytics ? (
                <li className="border-2 border-ink-700 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <label htmlFor={`${id}-analytics`} className="font-semibold">
                      Mesure d’audience
                    </label>
                    <input
                      id={`${id}-analytics`}
                      type="checkbox"
                      role="switch"
                      checked={analytics}
                      onChange={(event) => setAnalytics(event.target.checked)}
                      aria-describedby={`${id}-analytics-text`}
                      className="size-6 shrink-0 cursor-pointer accent-accent"
                    />
                  </div>
                  <p id={`${id}-analytics-text`} className="mt-2 text-sm text-paper-muted">
                    Google Analytics&nbsp;4&nbsp;: pages vues et usage du lecteur, de façon agrégée. Pas de
                    publicité, pas de signaux Google, adresse IP non conservée.
                  </p>
                </li>
              ) : (
                <li className="border-2 border-ink-700 p-4 text-sm text-paper-muted">
                  Aucun cookie de mesure d’audience ni de publicité n’est utilisé sur ce site&nbsp;: il
                  n’y a rien d’autre à paramétrer.
                </li>
              )}
            </ul>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
              {hasAnalytics ? (
                <>
                  <Button variant="outline" onClick={() => consentStore.refuseAll()}>
                    Tout refuser
                  </Button>
                  <Button variant="outline" onClick={() => consentStore.acceptAll()}>
                    Tout accepter
                  </Button>
                  <Button variant="outline" type="submit">
                    Enregistrer mes choix
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => consentStore.dismiss()}>
                  Fermer
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
