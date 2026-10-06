import { getSocialLinks } from "@/config/social";

import { socialIconPaths } from "./icons/socialIconPaths";

type SocialLinksProps = {
  size?: "sm" | "lg";
  /** Show the network name next to each icon. */
  showLabels?: boolean;
  className?: string;
};

const sizes = {
  sm: { link: "size-11", icon: "size-5" },
  lg: { link: "min-h-12 min-w-12 px-3", icon: "size-6" },
};

/** Icon links to the networks filled in `src/config/social.ts`; renders nothing if none are. */
export function SocialLinks({ size = "sm", showLabels = false, className = "" }: SocialLinksProps) {
  const links = getSocialLinks();
  if (links.length === 0) return null;
  const s = sizes[size];

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(({ network, label, href }) => (
        <li key={network}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={showLabels ? undefined : `${label} (s’ouvre dans un nouvel onglet)`}
            className={`inline-flex items-center justify-center gap-2.5 border-2 border-ink-600 text-paper-muted transition-colors hover:border-accent hover:text-accent ${s.link}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className={`shrink-0 fill-current ${s.icon}`}>
              <path d={socialIconPaths[network]} />
            </svg>
            {showLabels && (
              <span className="pr-1 text-sm font-semibold uppercase tracking-widest">
                {label}
                <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
