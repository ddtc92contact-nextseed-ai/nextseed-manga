import Link from "next/link";
import type { ReactNode } from "react";

import { LegalDetails, LegalEmail, LegalPage } from "@/components/LegalPage";
import { legal } from "@/config/legal";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Quelles données personnelles ${site.name} collecte (contact, newsletter, mesure d’audience, journaux techniques), pourquoi, combien de temps, et comment exercer vos droits.`,
  path: "/confidentialite",
});

type Processing = {
  id: string;
  title: string;
  purpose: ReactNode;
  legalBasis: ReactNode;
  data: ReactNode;
  retention: ReactNode;
  recipients: ReactNode;
  transfers: ReactNode;
};

const { publisher, host, emailProvider } = legal;

const processings: Processing[] = [
  {
    id: "contact",
    title: "Formulaire de contact",
    purpose: "Répondre à votre message (question, demande de collaboration, signalement…).",
    legalBasis:
      "Mesures précontractuelles prises à votre demande, ou intérêt légitime de l’éditeur à répondre aux personnes qui le contactent (article 6.1.b et 6.1.f du RGPD).",
    data: "Nom, adresse e-mail et contenu du message. Votre adresse IP est utilisée temporairement contre les abus (voir « Journaux techniques »).",
    retention:
      "Le temps de traiter votre demande, puis 3 ans maximum après le dernier échange. Le site lui-même ne stocke pas les messages : ils sont transmis par e-mail.",
    recipients: (
      <>
        L’éditeur uniquement. Sous-traitants&nbsp;: le fournisseur de messagerie ({emailProvider.name}) et
        l’hébergeur du site ({host.name}).
      </>
    ),
    transfers: <>Aucun transfert prévu hors de l’Union européenne (hébergement des e-mails&nbsp;: {emailProvider.location}).</>,
  },
  {
    id: "newsletter",
    title: "Newsletter",
    purpose:
      "Vous envoyer par e-mail les nouveaux chapitres et les nouvelles créations de l’atelier, si vous vous êtes inscrit·e.",
    legalBasis: "Votre consentement, donné en vous inscrivant (article 6.1.a du RGPD).",
    data: "Votre adresse e-mail, la date d’inscription, et les statistiques d’envoi de Brevo (ouvertures, clics, désinscription).",
    retention:
      "Jusqu’à votre désinscription (lien présent dans chaque e-mail). Les adresses inactives depuis 3 ans sont supprimées.",
    recipients:
      "L’éditeur. Sous-traitant : Brevo (Sendinblue SAS, 106 boulevard Haussmann, 75008 Paris), qui gère la liste et les envois.",
    transfers:
      "Brevo héberge les données dans l’Union européenne. Si un de ses propres sous-traitants y accède depuis un pays hors UE, le transfert est encadré par les clauses contractuelles types de la Commission européenne.",
  },
  {
    id: "analytics",
    title: "Mesure d’audience (Google Analytics 4)",
    purpose:
      "Savoir quelles pages et quels chapitres sont lus, d’où viennent les visiteurs et comment le lecteur est utilisé, pour améliorer le site. Uniquement si vous l’acceptez.",
    legalBasis: (
      <>
        Votre consentement (article 6.1.a du RGPD et article 82 de la loi Informatique et Libertés), recueilli
        par le bandeau cookies et modifiable à tout moment depuis la page <Link href="/cookies">Cookies</Link>.
        Sans accord, Google Analytics n’est pas chargé du tout.
      </>
    ),
    data: "Identifiant aléatoire stocké dans les cookies _ga, pages vues (adresse sans paramètres), titre de page, provenance, type d’appareil et de navigateur, pays et ville approximatifs, événements du lecteur (chapitre ouvert, mode de lecture). Google Analytics 4 ne conserve pas l’adresse IP ; les signaux Google et la personnalisation publicitaire sont désactivés. Aucune adresse e-mail ni contenu de formulaire n’est envoyé.",
    retention: "Cookies : 13 mois maximum. Données d’analyse dans Google Analytics : 14 mois maximum.",
    recipients: "L’éditeur. Sous-traitant : Google Ireland Limited (Gordon House, Barrow Street, Dublin 4, Irlande).",
    transfers:
      "Des données peuvent être transférées aux États-Unis vers Google LLC. Ce transfert repose sur la décision d’adéquation « EU-US Data Privacy Framework », à laquelle Google LLC est certifiée, complétée par les clauses contractuelles types.",
  },
  {
    id: "logs",
    title: "Journaux techniques et limitation des abus",
    purpose:
      "Faire fonctionner le site, assurer sa sécurité et bloquer les envois abusifs des formulaires (5 envois par adresse IP toutes les 15 minutes).",
    legalBasis: "Intérêt légitime de l’éditeur à sécuriser son site (article 6.1.f du RGPD).",
    data: "Adresse IP, date et heure, page demandée, navigateur (en-tête User-Agent), code de réponse.",
    retention:
      "Compteur anti-abus : en mémoire uniquement, 15 minutes au plus, effacé à chaque redémarrage. Journaux du serveur : rotation automatique, 12 mois maximum.",
    recipients: <>L’éditeur. Sous-traitant&nbsp;: l’hébergeur du site ({host.name}).</>,
    transfers: <>Aucun (localisation du serveur&nbsp;: {host.location}).</>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro={
        <p>
          {site.name} collecte le moins de données possible. Cette page explique, pour chaque traitement,
          ce qui est collecté, pourquoi, combien de temps, et comment exercer vos droits.
        </p>
      }
    >
      <h2>Responsable du traitement</h2>
      <p>
        {publisher.companyName} ({publisher.brand}), {publisher.address}, représentée par{" "}
        {legal.publicationDirector}. Contact pour toute question sur vos données&nbsp;:{" "}
        <LegalEmail email={publisher.email} />.
      </p>

      <h2>Les traitements en détail</h2>
      <nav aria-label="Traitements">
        <ul>
          {processings.map((processing) => (
            <li key={processing.id}>
              <a href={`#${processing.id}`}>{processing.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {processings.map((processing) => (
        <section key={processing.id} id={processing.id} aria-labelledby={`${processing.id}-title`}>
          <h3 id={`${processing.id}-title`}>{processing.title}</h3>
          <LegalDetails
            items={[
              ["Finalité", processing.purpose],
              ["Base légale", processing.legalBasis],
              ["Données", processing.data],
              ["Durée de conservation", processing.retention],
              ["Destinataires", processing.recipients],
              ["Transferts hors UE", processing.transfers],
            ]}
          />
        </section>
      ))}

      <h2>Cookies</h2>
      <p>
        Sans votre accord, seuls des éléments strictement nécessaires sont enregistrés dans votre navigateur
        (votre choix de cookies, vos préférences de lecture). Le détail et le bouton pour modifier votre
        choix sont sur la page <Link href="/cookies">Cookies</Link>.
      </p>

      <h2>Vos droits</h2>
      <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants&nbsp;:</p>
      <ul>
        <li>
          <strong>accès</strong>&nbsp;: savoir si des données vous concernant sont traitées et en obtenir une
          copie&nbsp;;
        </li>
        <li>
          <strong>rectification</strong>&nbsp;: faire corriger des données inexactes&nbsp;;
        </li>
        <li>
          <strong>effacement</strong>&nbsp;: faire supprimer vos données&nbsp;;
        </li>
        <li>
          <strong>opposition</strong>&nbsp;: vous opposer à un traitement fondé sur l’intérêt légitime&nbsp;;
        </li>
        <li>
          <strong>limitation</strong> et <strong>portabilité</strong> dans les cas prévus par le RGPD&nbsp;;
        </li>
        <li>
          <strong>retrait du consentement</strong> à tout moment&nbsp;: lien de désinscription dans chaque
          newsletter, bouton «&nbsp;Gérer les cookies&nbsp;» en bas de chaque page&nbsp;;
        </li>
        <li>
          <strong>directives post-mortem</strong>&nbsp;: définir le sort de vos données après votre décès.
        </li>
      </ul>

      <h3>Comment les exercer</h3>
      <p>
        Écrivez à <LegalEmail email={publisher.email} /> ou par courrier à {publisher.companyName},{" "}
        {publisher.address}, en précisant votre demande. Une réponse vous est apportée dans un délai d’un
        mois. Une pièce d’identité ne peut être demandée qu’en cas de doute raisonnable sur votre identité.
      </p>

      <h3>Réclamation auprès de la CNIL</h3>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la
        Commission nationale de l’informatique et des libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334
        Paris Cedex 07, ou en ligne sur <a href="https://www.cnil.fr/fr/plaintes">cnil.fr/fr/plaintes</a>.
      </p>

      <h2>Modifications</h2>
      <p>
        Cette politique peut évoluer, par exemple si un nouveau service est ajouté au site. La date de
        dernière mise à jour figure en haut de la page.
      </p>
    </LegalPage>
  );
}
