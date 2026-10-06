import Image from "next/image";
import Link from "next/link";

import type { ContentImage } from "@/lib/content";

type Target = { href: string; title: string; image?: ContentImage; label: string };

/** Previous / next navigation between pages of the same kind. */
export function PrevNext({
  previous,
  next,
  label,
}: {
  previous?: Target;
  next?: Target;
  label: string;
}) {
  if (!previous && !next) return null;
  return (
    <nav aria-label={label} className="mt-16 grid gap-4 border-t border-ink-700 pt-10 sm:grid-cols-2">
      {previous ? <PrevNextLink target={previous} /> : <span className="hidden sm:block" />}
      {next && <PrevNextLink target={next} alignEnd />}
    </nav>
  );
}

function PrevNextLink({ target, alignEnd = false }: { target: Target; alignEnd?: boolean }) {
  return (
    <Link
      href={target.href}
      className={`group flex items-center gap-4 border-2 border-ink-700 p-3 transition-colors hover:border-accent ${
        alignEnd ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      {target.image && (
        <span className="relative block h-20 w-15 shrink-0 overflow-hidden bg-ink-800">
          <Image
            src={target.image}
            alt=""
            fill
            sizes="60px"
            placeholder="blur"
            className="object-cover"
          />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-widest text-paper-faint">
          {target.label}
        </span>
        <span className="mt-1 block truncate font-display text-lg group-hover:text-accent">
          {target.title}
        </span>
      </span>
    </Link>
  );
}
