import type { StaticImageData } from "next/image";

import creation01 from "../../public/placeholder/creation-01.webp";
import creation02 from "../../public/placeholder/creation-02.webp";
import creation03 from "../../public/placeholder/creation-03.webp";
import creation04 from "../../public/placeholder/creation-04.webp";
import creation05 from "../../public/placeholder/creation-05.webp";
import creation06 from "../../public/placeholder/creation-06.webp";

export type Creation = {
  slug: string;
  title: string;
  series: string;
  year: number;
  image: StaticImageData;
  alt: string;
};

// PLACEHOLDER content: replace with the real creations once they are available.
export const latestCreations: Creation[] = [
  {
    slug: "blue-hour-ronin",
    title: "Blue Hour Ronin",
    series: "Placeholder · Vol. 01",
    year: 2026,
    image: creation01,
    alt: "Placeholder artwork: a silhouetted figure with a staff stands on a ridge in front of a huge pale-blue sun.",
  },
  {
    slug: "violet-signal",
    title: "Violet Signal",
    series: "Placeholder · Vol. 01",
    year: 2026,
    image: creation02,
    alt: "Placeholder artwork: a silhouetted figure stands against a lilac sun over a purple, screentoned sky.",
  },
  {
    slug: "ember-gate",
    title: "Ember Gate",
    series: "Placeholder · Vol. 02",
    year: 2026,
    image: creation03,
    alt: "Placeholder artwork: a lone figure on jagged rocks before a glowing red-orange sun.",
  },
  {
    slug: "tidewatcher",
    title: "Tidewatcher",
    series: "Placeholder · Vol. 02",
    year: 2026,
    image: creation04,
    alt: "Placeholder artwork: a figure raises a staff toward a teal sun, speed lines radiating outward.",
  },
  {
    slug: "amber-wanderer",
    title: "Amber Wanderer",
    series: "Placeholder · Vol. 03",
    year: 2026,
    image: creation05,
    alt: "Placeholder artwork: a silhouette crosses a ridge under a warm amber sun and dotted sky.",
  },
  {
    slug: "night-courier",
    title: "Night Courier",
    series: "Placeholder · Vol. 03",
    year: 2026,
    image: creation06,
    alt: "Placeholder artwork: a dark figure stands on a mountain ridge beneath an indigo sun.",
  },
];
