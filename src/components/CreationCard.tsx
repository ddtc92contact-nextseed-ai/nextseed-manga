import { type Creation, creationImage } from "@/lib/content";
import { plural, seriesStatusLabel } from "@/lib/format";

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
  const subtitle =
    creation.kind === "series"
      ? `${plural(creation.chapters.length, "chapitre")} · ${seriesStatusLabel[creation.status]}`
      : `Illustration · ${year}`;

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
      badge={creation.kind === "series" ? "Série" : undefined}
    />
  );
}
