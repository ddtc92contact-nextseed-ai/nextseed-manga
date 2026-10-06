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
