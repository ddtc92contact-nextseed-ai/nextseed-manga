/**
 * Legal identity of the publisher, used by /mentions-legales and /confidentialite.
 *
 * TODO(manager): replace every value starting with "TODO(manager)" (SIREN, registered office,
 * legal form, host, SMTP provider, contact email). They are shown as-is on the legal pages until
 * filled in. The site URL is never written here: it comes from SITE_URL (src/lib/site.ts).
 */
export const legal = {
  publisher: {
    companyName: "DDTC — DD TECH CONSULT",
    brand: "NextSeed-AI",
    /** e.g. "SASU au capital de 1 000 €". */
    legalForm: "TODO(manager): forme juridique et capital social (ex. SASU au capital de 1 000 €)",
    siren: "TODO(manager): numéro SIREN (9 chiffres)",
    /** e.g. "RCS Nanterre 123 456 789". */
    registration: "TODO(manager): RCS Nanterre + numéro",
    vatNumber: "TODO(manager): numéro de TVA intracommunautaire (ou supprimer la ligne)",
    address: "TODO(manager): numéro et rue, 92300 Levallois-Perret, France",
    /** Address for legal questions and privacy requests (access, erasure...). */
    email: "TODO(manager): adresse e-mail de contact (ex. contact@nextseed-ai.fr)",
  },
  /** Directeur de la publication. */
  publicationDirector: "David Duhamel, président de DDTC",
  host: {
    name: "TODO(manager): nom de l’hébergeur du serveur (VPS)",
    address: "TODO(manager): adresse postale de l’hébergeur",
    phone: "TODO(manager): téléphone de l’hébergeur",
    /** Country where the server is located (shown in the privacy policy). */
    location: "TODO(manager): pays du datacenter (ex. France)",
  },
  /** Email service the contact form sends through (SMTP_HOST). */
  emailProvider: {
    name: "TODO(manager): fournisseur de messagerie (SMTP) qui reçoit les messages du formulaire",
    location: "TODO(manager): pays d’hébergement des e-mails (ex. Union européenne)",
  },
  /** Date shown at the top of the legal pages ("Dernière mise à jour"). */
  lastUpdated: "2026-10-19",
} as const;

/** True for a value the manager still has to fill in. */
export function isPlaceholder(value: string): boolean {
  return value.startsWith("TODO(manager)");
}
