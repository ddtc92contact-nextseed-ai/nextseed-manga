import { connection } from "next/server";

import { getNewsletterProvider } from "@/server/newsletter";

import { NewsletterForm } from "./NewsletterForm";

type NewsletterSignupProps = {
  /**
   * `compact` for the footer; `panel` is a framed block meant for the end of a chapter
   * or page ("Recevez le prochain chapitre en avant-première").
   */
  variant?: "compact" | "panel";
  title?: string;
  text?: string;
  className?: string;
};

/**
 * Newsletter call-to-action. Renders nothing unless a provider is configured
 * (BREVO_API_KEY + BREVO_LIST_ID), read at request time. Wrap it in <Suspense>.
 */
export async function NewsletterSignup({
  variant = "compact",
  title = "Le prochain chapitre, en avant-première",
  text = "Nouvelles planches et nouveaux volumes, directement dans votre boîte mail. Zéro spam, désinscription en un clic.",
  className = "",
}: NewsletterSignupProps) {
  // Env vars are read at runtime on the VPS, not baked in at build time.
  await connection();
  if (!getNewsletterProvider()) return null;

  if (variant === "panel") {
    return (
      <aside
        aria-labelledby="newsletter-panel-title"
        className={`panel relative isolate overflow-hidden bg-ink-900 p-6 sm:p-10 ${className}`}
      >
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-screentone opacity-40" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-kicker text-accent">Newsletter</p>
        <h2 id="newsletter-panel-title" className="font-display text-2xl sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 mb-6 max-w-xl text-paper-muted">{text}</p>
        <div className="max-w-xl">
          <NewsletterForm />
        </div>
      </aside>
    );
  }

  return (
    <section aria-labelledby="newsletter-footer-title" className={className}>
      <h2 id="newsletter-footer-title" className="font-display text-lg">
        {title}
      </h2>
      <p className="mt-2 mb-4 text-sm text-paper-muted">{text}</p>
      <NewsletterForm />
    </section>
  );
}
