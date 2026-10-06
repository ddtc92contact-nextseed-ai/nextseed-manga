import Link from "next/link";

type Crumb = { label: string; href?: string };

/** "Galerie / Séries / Titre" trail; the last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="mb-8 text-xs font-semibold uppercase tracking-widest">
      <ol className="flex flex-wrap items-center gap-2 text-paper-faint">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-paper">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-paper-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
