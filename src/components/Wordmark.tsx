import Link from "next/link";

/** "NextSeed Manga" logotype with a hanko-style stamp. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 font-display text-lg leading-none ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center bg-accent text-sm text-ink-950 transition-transform duration-200 group-hover:-rotate-6"
      >
        NS
      </span>
      <span>
        NextSeed <span className="text-accent">Manga</span>
      </span>
    </Link>
  );
}
