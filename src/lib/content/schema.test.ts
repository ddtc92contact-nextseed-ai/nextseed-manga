import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { chapterSchema, seriesSchema } from "./schema";

const base = {
  title: "IA-MI",
  synopsis: "Synopsis.",
  cover: "cover.webp",
  coverAlt: "Cover.",
  tags: ["jeunesse"],
  status: "ongoing",
  date: "2026-10-06",
};

describe("seriesSchema", () => {
  it("defaults to webtoon, right-to-left, French", () => {
    const series = seriesSchema.parse(base);
    expect(series.readingMode).toBe("webtoon");
    expect(series.readingDirection).toBe("rtl");
    expect(series.language).toBe("fr");
  });

  it("rejects an unknown reading direction", () => {
    const result = seriesSchema.safeParse({ ...base, readingDirection: "ttb" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["readingDirection"]);
  });

  it("validates the real IA-MI entry as a left-to-right manga", () => {
    const file = path.join(process.cwd(), "content/series/ia-mi/series.json");
    const series = seriesSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    expect(series.readingMode).toBe("manga");
    expect(series.readingDirection).toBe("ltr");
  });
});

describe("chapterSchema", () => {
  it("accepts page alt texts keyed by image file name", () => {
    const chapter = { number: 1, title: "La rencontre", date: "2026-10-06" };
    expect(chapterSchema.safeParse({ ...chapter, pageAlt: { "001.webp": "Page 1." } }).success).toBe(true);
    expect(chapterSchema.safeParse({ ...chapter, pageAlt: { "page one": "Page 1." } }).success).toBe(false);
  });
});
