const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "2026-09-14" → "14 septembre 2026" (content dates are plain calendar dates). */
export const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));

const numberFormat = new Intl.NumberFormat("fr-FR");

/** French plural: 0 and 1 take the singular ("0 chapitre", "1 page", "3 pages"). */
export const plural = (count: number, word: string) =>
  `${numberFormat.format(count)}\u00a0${word}${count < 2 ? "" : "s"}`;
