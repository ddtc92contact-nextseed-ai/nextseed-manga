import { contactEmail, getSocialLinks } from "@/config/social";

import { buttonClasses } from "./Button";

/** Shown in place of the contact form when SMTP isn't configured. */
export function ContactFallback() {
  const hasSocials = getSocialLinks().length > 0;

  return (
    <div className="panel bg-ink-900 p-6 sm:p-10">
      <h3 className="font-display text-2xl">Drop us a line</h3>
      <p className="mt-3 max-w-xl leading-relaxed text-paper-muted">
        The contact form is taking a break.{" "}
        {contactEmail
          ? "The quickest way to reach the studio is a good old email:"
          : hasSocials
            ? "The quickest way to reach the studio is a message on one of the networks listed on this page."
            : "Please check back soon."}
      </p>
      {contactEmail && (
        <a href={`mailto:${contactEmail}`} className={buttonClasses({ size: "lg", className: "mt-8 normal-case! break-all" })}>
          {contactEmail}
        </a>
      )}
    </div>
  );
}
