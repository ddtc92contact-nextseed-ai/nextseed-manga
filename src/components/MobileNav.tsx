"use client";

import { useEffect, useId, useState } from "react";

type NavItem = { label: string; href: string };

/** Disclosure menu for the primary navigation below the `md` breakpoint. */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center border-2 border-paper text-paper"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          {open ? (
            <path d="M5 5l14 14M19 5L5 19" />
          ) : (
            <path d="M3 7h18M3 12h18M3 17h18" />
          )}
        </svg>
      </button>
      <nav
        id={menuId}
        aria-label="Primary"
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-ink-700 bg-ink-950 bg-screentone"
      >
        <ul className="flex flex-col px-gutter py-4">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-2xl uppercase text-paper hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
