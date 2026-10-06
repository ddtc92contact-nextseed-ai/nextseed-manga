"use client";

import { useActionState, useId } from "react";

import { subscribeToNewsletter } from "@/app/actions/newsletter";
import type { NewsletterState } from "@/server/newsletter";

import { Button } from "./Button";
import { fieldControlClasses } from "./FormField";
import { FormStatus } from "./FormStatus";

const initialState: NewsletterState = { status: "idle" };

/** Single-field email signup posting to the `subscribeToNewsletter` action. */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const id = useId();
  const error = state.fieldErrors?.email?.[0];

  return (
    <form action={formAction} noValidate>
      <label htmlFor={`${id}-email`} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-paper-muted">
        Adresse e-mail
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="vous@exemple.fr"
          defaultValue={state.values?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-status`}
          className={`${fieldControlClasses} min-h-11 sm:flex-1`}
        />
        <Button type="submit" disabled={pending} className="shrink-0 disabled:opacity-60">
          {pending ? "Inscription…" : "Je m’inscris"}
        </Button>
      </div>
      <div id={`${id}-status`}>
        <FormStatus state={state} className="mt-3 empty:hidden" />
      </div>
    </form>
  );
}
