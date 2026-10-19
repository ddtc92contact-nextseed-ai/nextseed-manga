/** Helpers to find and delete the Google Analytics cookies once consent is withdrawn. */

/** `_ga`, `_ga_<container-id>`, plus the legacy `_gid` / `_gat*` names. */
export const GA_COOKIE_PATTERN = /^(_ga($|_)|_gid$|_gat)/;

/** Names of the Google Analytics cookies present in a `document.cookie` string. */
export function gaCookieNames(cookieString: string): string[] {
  return cookieString
    .split(";")
    .map((pair) => pair.split("=")[0]?.trim() ?? "")
    .filter((name) => GA_COOKIE_PATTERN.test(name));
}

/**
 * Domains a cookie may have been set on for `hostname`: GA writes its cookies on the widest
 * domain it can (e.g. `.example.com` for `manga.example.com`), so every parent domain is tried.
 * `undefined` stands for a host-only cookie (no Domain attribute).
 */
export function cookieDomains(hostname: string): (string | undefined)[] {
  const domains: (string | undefined)[] = [undefined];
  // IP addresses and single-label hosts (localhost) only get host-only cookies.
  if (/^[\d.]+$/.test(hostname) || hostname.includes(":")) return domains;
  const labels = hostname.split(".").filter(Boolean);
  for (let i = 0; i < labels.length - 1; i++) {
    const domain = labels.slice(i).join(".");
    domains.push(domain, `.${domain}`);
  }
  return domains;
}

/** `document.cookie` assignments that expire every GA cookie on every candidate domain. */
export function gaCookieDeletions(cookieString: string, hostname: string): string[] {
  return gaCookieNames(cookieString).flatMap((name) =>
    cookieDomains(hostname).map(
      (domain) =>
        `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${domain ? `; Domain=${domain}` : ""}`,
    ),
  );
}
