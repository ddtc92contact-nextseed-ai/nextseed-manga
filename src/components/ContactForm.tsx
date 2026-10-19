"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendContactMessage } from "@/app/actions/contact";
import type { ContactState } from "@/server/contact";

import { Button } from "./Button";
import { FormField } from "./FormField";
import { FormStatus } from "./FormStatus";

const initialState: ContactState = { status: "idle" };

/** Contact form (name, email, message + honeypot) posting to the `sendContactMessage` action. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="relative grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Nom"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={values.name}
          errors={errors.name}
        />
        <FormField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={values.email}
          errors={errors.email}
        />
      </div>
      <FormField
        label="Message"
        name="message"
        multiline
        rows={6}
        required
        maxLength={5000}
        defaultValue={values.message}
        errors={errors.message}
      />

      <p className="text-sm leading-relaxed text-paper-faint">
        Vos nom, e-mail et message servent uniquement à vous répondre et ne sont jamais revendus ni utilisés
        pour de la prospection.{" "}
        <Link href="/confidentialite#contact" className="text-paper-muted underline underline-offset-2 hover:text-paper">
          En savoir plus sur vos données
        </Link>
      </p>

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="contact-website">Laissez ce champ vide</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-60">
          {pending ? "Envoi…" : "Envoyer le message"}
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
