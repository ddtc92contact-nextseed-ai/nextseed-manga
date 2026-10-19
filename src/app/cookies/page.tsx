import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { buttonClasses } from "@/components/Button";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { LegalDetails, LegalPage } from "@/components/LegalPage";
import { CONSENT_DURATION_MONTHS, CONSENT_STORAGE_KEY } from "@/lib/consent/store";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getGaMeasurementId } from "@/server/analytics";

export const metadata = pageMetadata({
  title: "Cookies",
  description: `Les cookies et le stockage local utilisés par ${site.name}, à quoi ils servent, combien de temps ils durent, et comment modifier votre choix.`,
  path: "/cookies",
});

type StorageItem = { name: string; kind: string; purpose: string; lifetime: string };

const necessary: StorageItem[] = [
  {
    name: CONSENT_STORAGE_KEY,
    kind: "Stockage local du navigateur",
    purpose: "Mémorise votre choix sur les cookies (accepté ou refusé) et sa date.",
    lifetime: `${CONSENT_DURATION_MONTHS} mois, puis le bandeau vous redemande votre avis`,
  },
  {
    name: "nextseed:reader-mode:<série>, nextseed:reader-direction:<série>",
    kind: "Stockage local du navigateur",
    purpose: "Retient le mode de lecture (webtoon ou manga) et le sens de lecture choisis pour chaque série.",
    lifetime: "Jusqu’à ce que vous effaciez les données du site dans votre navigateur",
  },
];

function analyticsCookies(gaId: string): StorageItem[] {
  return [
    {
      name: "_ga",
      kind: "Cookie Google Analytics",
      purpose: "Distingue les visiteurs de façon anonyme (identifiant aléatoire) pour compter les visites.",
      lifetime: "13 mois",
    },
    {
      name: `_ga_${gaId.replace(/^G-/, "")}`,
      kind: "Cookie Google Analytics",
      purpose: "Conserve l’état de la session de mesure (nombre de visites, début de la session).",
      lifetime: "13 mois",
    },
  ];
}

function StorageList({ items }: { items: StorageItem[] }) {
  return (
    <ul className="mt-4! grid list-none! gap-4 pl-0!">
      {items.map((item) => (
        <li key={item.name} className="border-2 border-ink-700 p-4 sm:p-5">
          <p className="mt-0! font-mono text-sm break-all text-paper">{item.name}</p>
          <LegalDetails
            items={[
              ["Type", item.kind],
              ["Finalité", item.purpose],
              ["Durée", item.lifetime],
            ]}
          />
        </li>
      ))}
    </ul>
  );
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      intro={
        <p>
          Un cookie est un petit fichier déposé dans votre navigateur. Ce site en utilise très peu&nbsp;: aucun
          cookie publicitaire, aucun réseau social embarqué, aucune police chargée depuis Google.
        </p>
      }
    >
      <h2>Votre choix</h2>
      <p>
        Vous pouvez accepter ou refuser la mesure d’audience à tout moment. Refuser n’a aucune conséquence sur
        votre visite. Si vous retirez votre accord, les cookies Google Analytics sont supprimés.
      </p>
      <CookieSettingsButton className={buttonClasses({ variant: "outline", className: "mt-6" })}>
        Gérer mes cookies
      </CookieSettingsButton>

      <h2>Strictement nécessaires</h2>
      <p>
        Exemptés de consentement&nbsp;: ils servent uniquement à faire fonctionner le site comme vous l’avez
        demandé, restent dans votre navigateur et ne sont jamais transmis à un tiers.
      </p>
      <StorageList items={necessary} />

      <Suspense>
        <AnalyticsSection />
      </Suspense>

      <h2>En savoir plus</h2>
      <p>
        Le traitement de vos données est détaillé dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Vous pouvez aussi bloquer ou
        supprimer les cookies dans les réglages de votre navigateur, ou consulter les{" "}
        <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/comment-se-proteger/maitriser-votre-navigateur">
          conseils de la CNIL
        </a>
        .
      </p>
    </LegalPage>
  );
}

/** GA cookies, listed only when GA_MEASUREMENT_ID is configured (read at request time). */
async function AnalyticsSection() {
  await connection();
  const gaId = getGaMeasurementId();
  if (!gaId) {
    return (
      <>
        <h2>Mesure d’audience</h2>
        <p>Aucun outil de mesure d’audience n’est actif sur le site pour le moment.</p>
      </>
    );
  }
  return (
    <>
      <h2>Mesure d’audience (avec votre accord)</h2>
      <p>
        Déposés par Google Analytics&nbsp;4 seulement si vous acceptez la mesure d’audience. Sans accord, le
        script de Google n’est même pas chargé. Ils servent à produire des statistiques de fréquentation
        agrégées&nbsp;; les signaux Google et la publicité sont désactivés.
      </p>
      <StorageList items={analyticsCookies(gaId)} />
    </>
  );
}
