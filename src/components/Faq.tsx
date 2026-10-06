type FaqItem = { question: string; answer: string };

/** Accordion of questions built on native <details>, keyboard-accessible out of the box. */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y-2 divide-ink-700 border-y-2 border-ink-700">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg hover:text-accent sm:text-xl [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center border-2 border-paper text-base transition-transform duration-200 group-open:rotate-45 group-open:border-accent group-open:text-accent"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-paper-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
