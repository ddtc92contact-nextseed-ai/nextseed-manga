import Link from "next/link";

type TagListProps = {
  tags: readonly string[];
  className?: string;
};

/** Tags of a creation, each linking to its filtered gallery page. */
export function TagList({ tags, className = "" }: TagListProps) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/gallery/tags/${tag}`}
            className="inline-block border border-ink-600 px-3 py-1 text-sm text-paper-muted transition-colors hover:border-accent hover:text-paper"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
