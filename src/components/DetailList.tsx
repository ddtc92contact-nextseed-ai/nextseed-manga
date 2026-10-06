import type { ReactNode } from "react";

/** Label / value pairs for a creation's details (date, status, AI tools...). */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-ink-700 py-5 text-sm">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="font-semibold uppercase tracking-widest text-paper-faint">{item.label}</dt>
          <dd className="text-paper">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
