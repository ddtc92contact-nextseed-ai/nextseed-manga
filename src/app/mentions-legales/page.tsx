import Link from "next/link";

import { LegalDetails, LegalEmail, LegalPage } from "@/components/LegalPage";
import { legal } from "@/config/legal";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: `Éditeur, directeur de la publication et hébergeur du site ${site.name}, édité par ${legal.publisher.companyName} (${legal.publisher.brand}).`,
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  const { publisher, host } = legal;
  return (
    <LegalPage
      title="Mentions légales"
      intro={
        <p>
          Informations prévues par l’article&nbsp;6 de la loi n°&nbsp;2004-575 du 21&nbsp;juin 2004 pour la
          confiance dans l’économie numérique (LCEN).
        </p>
      }
    >
      <h2>Éditeur du site</h2>
      <p>
        Le site <a href={site.url}>{site.url.replace(/^https?:\/\//, "")}</a> ({site.name}) est édité par&nbsp;:
      </p>
      <LegalDetails
        items={[
          ["Société", publisher.companyName],
          ["Marque", publisher.brand],
          ["Forme juridique", publisher.legalForm],
          ["SIREN", publisher.siren],
          ["Immatriculation", publisher.registration],
          ["TVA intracommunautaire", publisher.vatNumber],
          ["Siège social", publisher.address],
          ["Contact", <LegalEmail key="email" email={publisher.email} />],
        ]}
      />

      <h2>Directeur de la publication</h2>
      <p>{legal.publicationDirector}.</p>

      <h2>Hébergement</h2>
      <LegalDetails
        items={[
          ["Hébergeur", host.name],
          ["Adresse", host.address],
          ["Téléphone", host.phone],
        ]}
      />

      <h2>Contact</h2>
      <p>
        Pour toute question sur le site, écrivez à <LegalEmail email={publisher.email} /> ou utilisez le{" "}
        <Link href="/about#contact">formulaire de contact</Link>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les histoires, illustrations, planches, textes et éléments graphiques de ce site sont la propriété de{" "}
        {publisher.companyName} ({publisher.brand}), sauf mention contraire. Les images sont créées avec des
        outils d’IA générative, puis sélectionnées, retouchées et mises en page par l’atelier. Toute
        reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite,
        en dehors du partage avec mention de la source et lien vers le site.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        La façon dont vos données sont traitées est expliquée dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>, et les cookies utilisés sur la page{" "}
        <Link href="/cookies">Cookies</Link>.
      </p>
    </LegalPage>
  );
}
