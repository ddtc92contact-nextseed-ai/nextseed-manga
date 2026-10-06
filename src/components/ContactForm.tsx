"use client";

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
          label="Name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={values.name}
          errors={errors.name}
        />
        <FormField
          label="Email"
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

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-60">
          {pending ? "Sending…" : "Send message"}
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
