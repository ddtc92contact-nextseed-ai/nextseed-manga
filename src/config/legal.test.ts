import { describe, expect, it } from "vitest";

import { isPlaceholder, legal } from "./legal";

/** Every string value of the legal config, with its path (e.g. "publisher.siren"). */
function entries(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => entries(child, path ? `${path}.${key}` : key));
  }
  return [];
}

describe("legal config", () => {
  const values = entries(legal);

  it("has no placeholder left", () => {
    const left = values.filter(([, value]) => isPlaceholder(value) || /TODO|placeholder/i.test(value));
    expect(left).toEqual([]);
  });

  it("has no empty value", () => {
    expect(values.filter(([, value]) => !value.trim())).toEqual([]);
  });

  it("names the publication director by function, not by a person", () => {
    expect(legal.publicationDirector).toBe("Le Président de DD TECH CONSULT");
  });

  it("keeps SIREN, SIRET, RCS and VAT number consistent", () => {
    const siren = legal.publisher.siren.replace(/\s/g, "");
    expect(siren).toMatch(/^\d{9}$/);
    expect(legal.publisher.siret.replace(/\s/g, "")).toMatch(new RegExp(`^${siren}\\d{5}$`));
    expect(legal.publisher.registration.replace(/\s/g, "")).toContain(siren);
    expect(legal.publisher.vatNumber).toMatch(new RegExp(`^FR\\d{2}${siren}$`));
  });
});
