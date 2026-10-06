import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

type ArtworkCardProps = {
  title: string;
  /** Secondary line: series, volume, chapter... */
  subtitle?: string;
  image: StaticImageData | string;
  alt: string;
  /** Optional link target; the whole card becomes clickable. */
  href?: string;
  /** Panel number shown in the corner, e.g. 1 → "01". */
  index?: number;
  /** `sizes` attribute for next/image; defaults to a 2/3-column grid. */
  sizes?: string;
  preload?: boolean;
};

/** Portrait (3:4) artwork tile styled as a manga panel. */
export function ArtworkCard({
  title,
  subtitle,
  image,
  alt,
  href,
  index,
  sizes = "(min-width: 768px) 33vw, 50vw",
  preload = false,
}: ArtworkCardProps) {
  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden border-2 border-paper bg-ink-800 transition-shadow duration-200 group-hover:shadow-[6px_6px_0_0_var(--color-accent)] group-focus-visible:shadow-[6px_6px_0_0_var(--color-accent)]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          placeholder={typeof image === "string" ? "empty" : "blur"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {index !== undefined && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bg-paper px-2 py-1 font-display text-xs text-ink-950"
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <h3 className="font-display text-base leading-tight sm:text-lg group-hover:text-accent">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs uppercase tracking-wider text-paper-faint sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </>
  );

  return (
    <article>
      {href ? (
        <Link href={href} className="group block">
          {body}
        </Link>
      ) : (
        <div className="group">{body}</div>
      )}
    </article>
  );
}
