import type { ReadingDirection } from "./types";

/**
 * Manga-mode page order, in one place so the click zones, arrow keys, swipes, page track,
 * progress bar and chrome buttons all agree with the series `readingDirection`.
 *
 * - `ltr` (Western / French): the next page sits on the right; right arrow, right-side tap and
 *   swipe-left go forward.
 * - `rtl` (Japanese): the next page sits on the left; left arrow, left-side tap and swipe-right
 *   go forward.
 */

/** Horizontal side of the screen where the next page sits: -1 left, 1 right. */
export const nextSide = (direction: ReadingDirection): -1 | 1 => (direction === "rtl" ? -1 : 1);

/** Page step for a tap on one side of the screen. */
export const stepForSide = (direction: ReadingDirection, side: "left" | "right"): -1 | 1 =>
  side === "right" ? nextSide(direction) : (-nextSide(direction) as -1 | 1);

/** Page step for a horizontal drag of `dx` px (negative = finger moved left, i.e. swipe-left). */
export const stepForSwipe = (direction: ReadingDirection, dx: number): -1 | 1 =>
  stepForSide(direction, dx < 0 ? "right" : "left");

/** Arrow keys that turn the page forward / back. */
export const arrowKeys = (direction: ReadingDirection) =>
  direction === "rtl"
    ? ({ forward: "ArrowLeft", backward: "ArrowRight" } as const)
    : ({ forward: "ArrowRight", backward: "ArrowLeft" } as const);

/** Page step for an arrow key, or 0 when the key does not turn pages. */
export const stepForKey = (direction: ReadingDirection, key: string): -1 | 0 | 1 => {
  const { forward, backward } = arrowKeys(direction);
  return key === forward ? 1 : key === backward ? -1 : 0;
};

/** Horizontal position (in page widths) of page `index` relative to the current `page`. */
export const pageOffset = (direction: ReadingDirection, index: number, page: number) =>
  (index - page) * nextSide(direction);
