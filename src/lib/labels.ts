import type { Language, SeriesStatus } from "./content/schema";

/**
 * Labels shown around a series, in the language of its lettering (`language` in series.json):
 * a French manga reads "Chapitre 1 · Lire", an English one "Chapter 1 · Read".
 */
const labels = {
  fr: {
    gallery: "Galerie",
    series: "Série",
    status: { ongoing: "En cours", completed: "Terminée", hiatus: "En pause" },
    chapter: (n: number) => `Chapitre ${n}`,
    chapters: "Chapitres",
    chapterCount: (n: number) => `${n} chapitre${n > 1 ? "s" : ""}`,
    pageCount: (n: number) => `${n} page${n > 1 ? "s" : ""}`,
    startReading: "Commencer la lecture",
    read: (n: number) => `Lire le chapitre ${n}`,
    noChapter: "Le premier chapitre est en cours d’encrage.",
    started: "Début",
    updated: "Mise à jour",
    madeWith: "Réalisé avec",
    backToSeries: "Retour à la série",
    featured: "Nouvelle série à la une",
    discoverSeries: "Découvrir la série",
    readDescription: (n: number, title: string) => `Lire le chapitre ${n} de ${title}.`,
    reader: {
      short: (n: number) => `Chap. ${n}`,
      backTo: (title: string) => `Retour à ${title}`,
      readingMode: "Mode de lecture",
      reader: "Lecteur",
      pages: "Pages du chapitre",
      viewer: "visionneuse de pages",
      previousChapter: "Chapitre précédent",
      nextChapter: "Chapitre suivant",
      previousPage: "Page précédente",
      nextPage: "Page suivante",
      end: "Fin",
      endOf: (n: number) => `Fin du chapitre ${n}`,
      pageOf: (page: number, total: number) => `Page ${page} sur ${total}`,
      chapterLink: (label: string, n: number, title: string) => `${label}\u00a0: chapitre ${n}, ${title}`,
      direction: (rtl: boolean) =>
        `Sens de lecture\u00a0: ${rtl ? "de droite à gauche" : "de gauche à droite"}. Changer.`,
      switchDirection: "Changer le sens de lecture",
      directionShort: (rtl: boolean) => (rtl ? "D→G" : "G→D"),
      upNext: "À suivre",
      caughtUp: "Vous êtes à jour",
      nextTitle: (n: number, title: string) => `Chapitre ${n}\u00a0: ${title}`,
      latest: (title: string) => `C’était le dernier chapitre paru de ${title}.`,
      backToSeries: "Retour à la série",
    },
  },
  en: {
    gallery: "Gallery",
    series: "Series",
    status: { ongoing: "Ongoing", completed: "Completed", hiatus: "On hiatus" },
    chapter: (n: number) => `Chapter ${n}`,
    chapters: "Chapters",
    chapterCount: (n: number) => `${n} chapter${n === 1 ? "" : "s"}`,
    pageCount: (n: number) => `${n} page${n === 1 ? "" : "s"}`,
    startReading: "Start reading",
    read: (n: number) => `Read chapter ${n}`,
    noChapter: "The first chapter is still being inked.",
    started: "Started",
    updated: "Updated",
    madeWith: "Made with",
    backToSeries: "Back to the series",
    featured: "Featured series",
    discoverSeries: "About the series",
    readDescription: (n: number, title: string) => `Read chapter ${n} of ${title}.`,
    reader: {
      short: (n: number) => `Ch. ${n}`,
      backTo: (title: string) => `Back to ${title}`,
      readingMode: "Reading mode",
      reader: "Reader",
      pages: "Chapter pages",
      viewer: "page viewer",
      previousChapter: "Previous chapter",
      nextChapter: "Next chapter",
      previousPage: "Previous page",
      nextPage: "Next page",
      end: "End",
      endOf: (n: number) => `End of chapter ${n}`,
      pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
      chapterLink: (label: string, n: number, title: string) => `${label}: chapter ${n}, ${title}`,
      direction: (rtl: boolean) =>
        `Reading direction: ${rtl ? "right to left" : "left to right"}. Switch.`,
      switchDirection: "Switch reading direction",
      directionShort: (rtl: boolean) => (rtl ? "RTL" : "LTR"),
      upNext: "Up next",
      caughtUp: "All caught up",
      nextTitle: (n: number, title: string) => `Chapter ${n}: ${title}`,
      latest: (title: string) => `That was the latest chapter of ${title}.`,
      backToSeries: "Back to series",
    },
  },
} satisfies Record<Language, { status: Record<SeriesStatus, string> } & Record<string, unknown>>;

export const seriesLabels = (language: Language) => labels[language];

const dateFormats = Object.fromEntries(
  (["fr", "en"] as const).map((lang) => [
    lang,
    new Intl.DateTimeFormat(lang, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
  ]),
) as Record<Language, Intl.DateTimeFormat>;

/** "2026-10-06" → "6 octobre 2026" / "October 6, 2026". */
export const formatDateIn = (language: Language, date: string) =>
  dateFormats[language].format(new Date(`${date}T00:00:00Z`));
