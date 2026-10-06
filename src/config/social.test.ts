import { describe, expect, it } from "vitest";

import { getSocialLinks } from "./social";

describe("getSocialLinks", () => {
  it("keeps only the networks with a URL, in config order", () => {
    expect(
      getSocialLinks({ instagram: "https://instagram.com/me", x: "", tiktok: "  ", pixiv: "https://pixiv.net/u/1" }),
    ).toEqual([
      { network: "instagram", label: "Instagram", href: "https://instagram.com/me" },
      { network: "pixiv", label: "Pixiv", href: "https://pixiv.net/u/1" },
    ]);
  });
});
