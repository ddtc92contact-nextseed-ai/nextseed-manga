const dateFormat = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "2026-09-14" → "September 14, 2026" (content dates are plain calendar dates). */
export const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
