/**
 * Legal identity of the publisher, used by /mentions-legales and /confidentialite.
 *
 * The publisher is the company, never a person: no personal first or last name may appear here
 * (the publication director is named by function). `src/config/legal.test.ts` fails if a
 * "TODO(manager)" placeholder comes back. The site URL is never written here: it comes from
 * SITE_URL (src/lib/site.ts).
 */
export const legal = {
  publisher: {
    companyName: "DD TECH CONSULT",
    brand: "NextSeed-AI",
    legalForm: "Société par actions simplifiée (SAS) à capital variable, au capital de 100\u00a0€",
    siren: "999 528 664",
    siret: "999 528 664 00017",
    registration: "RCS Nanterre 999 528 664",
    vatNumber: "FR75999528664",
    apeCode: "6202A (Conseil en systèmes et logiciels informatiques)",
    address: "64 rue Anatole France, 92300 Levallois-Perret, France",
    /** Address for legal questions and privacy requests (access, erasure...). */
    email: "contact@nextseed-ai.org",
  },
  /** Directeur de la publication: the function, never a personal name. */
  publicationDirector: "Le Président de DD TECH CONSULT",
  /** Host of the VPS the site runs on. */
  host: {
    name: "Hostinger International Ltd",
    address: "61 Lordou Vironos Street, 6023 Larnaca, Chypre",
    website: "https://www.hostinger.fr",
  },
  /** Date shown at the top of the legal pages ("Dernière mise à jour"). */
  lastUpdated: "2026-10-19",
} as const;

/** True for a value the manager still has to fill in. */
export function isPlaceholder(value: string): boolean {
  return value.startsWith("TODO(manager)");
}
