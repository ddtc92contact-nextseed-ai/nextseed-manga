import { describe, expect, it } from "vitest";

import { arrowKeys, nextSide, pageOffset, stepForKey, stepForSide, stepForSwipe } from "./direction";

/** Replays a list of inputs from page 0 the way MangaView clamps them (0..pages = end screen). */
const read = (steps: number[], pages: number) =>
  steps.reduce((page, step) => Math.min(pages, Math.max(0, page + step)), 0);

describe("left-to-right (IA-MI)", () => {
  const d = "ltr";

  it("goes forward with the right arrow, right-side tap and swipe-left", () => {
    expect(stepForKey(d, "ArrowRight")).toBe(1);
    expect(stepForSide(d, "right")).toBe(1);
    expect(stepForSwipe(d, -120)).toBe(1);
  });

  it("goes back with the left arrow, left-side tap and swipe-right", () => {
    expect(stepForKey(d, "ArrowLeft")).toBe(-1);
    expect(stepForSide(d, "left")).toBe(-1);
    expect(stepForSwipe(d, 120)).toBe(-1);
  });

  it("lays the next page out on the right", () => {
    expect(nextSide(d)).toBe(1);
    expect(pageOffset(d, 4, 3)).toBe(1);
    expect(pageOffset(d, 2, 3)).toBe(-1);
  });

  it("reads pages 1 → 12 in order with the right arrow", () => {
    const step = stepForKey(d, "ArrowRight");
    const seen = Array.from({ length: 12 }, (_, i) => read(Array(i).fill(step), 12) + 1);
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(read(Array(12).fill(step), 12)).toBe(12); // then the end-of-chapter screen
  });
});

describe("right-to-left (Japanese order)", () => {
  const d = "rtl";

  it("goes forward with the left arrow, left-side tap and swipe-right", () => {
    expect(stepForKey(d, "ArrowLeft")).toBe(1);
    expect(stepForSide(d, "left")).toBe(1);
    expect(stepForSwipe(d, 120)).toBe(1);
  });

  it("goes back with the right arrow, right-side tap and swipe-left", () => {
    expect(stepForKey(d, "ArrowRight")).toBe(-1);
    expect(stepForSide(d, "right")).toBe(-1);
    expect(stepForSwipe(d, -120)).toBe(-1);
  });

  it("lays the next page out on the left", () => {
    expect(nextSide(d)).toBe(-1);
    expect(pageOffset(d, 4, 3)).toBe(-1);
    expect(arrowKeys(d)).toEqual({ forward: "ArrowLeft", backward: "ArrowRight" });
  });

  it("reaches the end screen with left taps and stays within bounds", () => {
    expect(read(Array(20).fill(stepForSide(d, "left")), 12)).toBe(12);
    expect(read([stepForSide(d, "right")], 12)).toBe(0);
  });
});

it("ignores keys that do not turn pages", () => {
  expect(stepForKey("ltr", "ArrowUp")).toBe(0);
  expect(stepForKey("rtl", "a")).toBe(0);
});
