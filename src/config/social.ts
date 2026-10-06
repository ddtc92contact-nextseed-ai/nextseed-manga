/**
 * Social networks & public contact details.
 *
 * TODO(manager): fill in your profile URLs. Leave a value empty ("") to hide that network
 * everywhere (footer + /about). Icons exist for every key listed here.
 */
export const socialLinks = {
  instagram: "https://www.instagram.com/",
  x: "https://x.com/",
  tiktok: "",
  youtube: "",
  pixiv: "https://www.pixiv.net/",
  bluesky: "",
  threads: "",
  discord: "",
  patreon: "",
} satisfies Record<SocialNetwork, string>;

/**
 * Public email shown as the fallback when the contact form can't send (SMTP not configured).
 * TODO(manager): replace with your real address, or "" to only point to the social links.
 */
export const contactEmail = "contact@example.com";

export type SocialNetwork =
  | "instagram"
  | "x"
  | "tiktok"
  | "youtube"
  | "pixiv"
  | "bluesky"
  | "threads"
  | "discord"
  | "patreon";

export const socialLabels: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  x: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
  pixiv: "Pixiv",
  bluesky: "Bluesky",
  threads: "Threads",
  discord: "Discord",
  patreon: "Patreon",
};

export type SocialLink = { network: SocialNetwork; label: string; href: string };

/** Networks with a URL, in config order. Empty entries are skipped. */
export function getSocialLinks(
  links: Partial<Record<SocialNetwork, string>> = socialLinks,
): SocialLink[] {
  return (Object.entries(links) as [SocialNetwork, string | undefined][])
    .filter(([, href]) => Boolean(href?.trim()))
    .map(([network, href]) => ({ network, label: socialLabels[network], href: href!.trim() }));
}
