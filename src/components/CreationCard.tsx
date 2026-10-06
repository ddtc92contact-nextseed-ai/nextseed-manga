import { type Creation, creationImage } from "@/lib/content";
import { seriesLabels } from "@/lib/labels";

import { ArtworkCard } from "./ArtworkCard";

type CreationCardProps = {
  creation: Creation;
  sizes: string;
  index?: number;
  /** Keep the image's own proportions (masonry) instead of the 3:4 frame. */
  naturalRatio?: boolean;
  preload?: boolean;
};

/** ArtworkCard for a standalone artwork or a series cover, linking to its page. */
export function CreationCard({ creation, sizes, index, naturalRatio, preload }: CreationCardProps) {
  const { image, alt } = creationImage(creation);
  const year = creation.date.slice(0, 4);
  let subtitle = `Artwork · ${year}`;
  let badge: string | undefined;
  if (creation.kind === "series") {
    // Series labels follow the language of the manga ("1 chapitre · En cours").
    const t = seriesLabels(creation.language);
    subtitle = `${t.chapterCount(creation.chapters.length)} · ${t.status[creation.status]}`;
    badge = t.series;
  }

  return (
    <ArtworkCard
      title={creation.title}
      subtitle={subtitle}
      image={image}
      alt={alt}
      href={creation.href}
      index={index}
      sizes={sizes}
      preload={preload}
      ratio={naturalRatio ? image.width / image.height : undefined}
      badge={badge}
    />
  );
}
