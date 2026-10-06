import { contactEmail, getSocialLinks } from "@/config/social";

import { buttonClasses } from "./Button";

/** Shown in place of the contact form when SMTP isn't configured. */
export function ContactFallback() {
  const hasSocials = getSocialLinks().length > 0;

  return (
    <div className="panel bg-ink-900 p-6 sm:p-10">
      <h3 className="font-display text-2xl">Un petit mot&nbsp;?</h3>
      <p className="mt-3 max-w-xl leading-relaxed text-paper-muted">
        Le formulaire de contact fait une pause.{" "}
        {contactEmail
          ? "Le plus rapide pour joindre l’atelier, c’est un bon vieil e-mail\u00a0:"
          : hasSocials
            ? "Le plus rapide pour joindre l’atelier, c’est un message sur l’un des réseaux listés sur cette page."
            : "Revenez très bientôt\u00a0!"}
      </p>
      {contactEmail && (
        <a href={`mailto:${contactEmail}`} className={buttonClasses({ size: "lg", className: "mt-8 normal-case! break-all" })}>
          {contactEmail}
        </a>
      )}
    </div>
  );
}
