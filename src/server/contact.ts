import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";

import { site } from "@/lib/site";

import type { FormState } from "./form-state";
import { type Env, formString } from "./form-state";
import type { RateLimiter } from "./rate-limit";

/** Name of the hidden anti-spam field: humans never see it, bots tend to fill it in. */
export const HONEYPOT_FIELD = "website";

const SENT_MESSAGE = "Merci\u00a0! Votre message est bien parti.";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Indiquez votre nom.")
    .max(100, "Votre nom ne doit pas dépasser 100 caractères.")
    // Collapse whitespace (incl. newlines) so the name is safe in an email subject.
    .transform((v) => v.replace(/\s+/g, " ")),
  email: z
    .string()
    .trim()
    .min(1, "Indiquez votre adresse e-mail.")
    .max(254, "Cette adresse e-mail est trop longue.")
    .pipe(z.email("Cette adresse e-mail n’est pas valide.")),
  message: z
    .string()
    .trim()
    .min(10, "Votre message est un peu court (10 caractères minimum).")
    .max(5000, "Votre message ne doit pas dépasser 5\u202f000 caractères."),
});

export type ContactField = keyof z.input<typeof contactSchema>;
export type ContactState = FormState<ContactField>;

export type SmtpConfig = {
  host: string;
  port: number;
  /** Implicit TLS (port 465); other ports upgrade with STARTTLS when available. */
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
};

/** SMTP settings from env vars, or null when the contact form isn't configured. */
export function getSmtpConfig(env: Env = process.env): SmtpConfig | null {
  const host = env.SMTP_HOST?.trim();
  const to = env.CONTACT_TO?.trim();
  if (!host || !to) return null;

  const port = Number(env.SMTP_PORT?.trim() || 587);
  if (!Number.isInteger(port) || port <= 0) return null;

  const user = env.SMTP_USER?.trim() || undefined;
  return {
    host,
    port,
    secure: port === 465,
    user,
    pass: env.SMTP_PASS || undefined,
    from: env.SMTP_FROM?.trim() || user || to,
    to,
  };
}

export type Mailer = Pick<Transporter, "sendMail">;

export function createSmtpMailer(config: SmtpConfig): Mailer {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });
}

/**
 * Validates a contact form submission and emails it to CONTACT_TO.
 * Framework-free so it can be tested with a mock transport.
 */
export async function handleContactSubmission(
  formData: FormData,
  deps: { ip: string; config: SmtpConfig | null; mailer?: Mailer; limiter: RateLimiter },
): Promise<ContactState> {
  const values = {
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
  };

  if (!deps.config) {
    return { status: "error", message: "Le formulaire de contact est indisponible pour le moment.", values };
  }

  // Honeypot filled: pretend it worked so bots don't learn anything.
  if (formString(formData, HONEYPOT_FIELD)) {
    return { status: "success", message: SENT_MESSAGE };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrigez les champs signalés, puis renvoyez.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  if (!deps.limiter.check(deps.ip)) {
    return {
      status: "error",
      message: "Vous avez envoyé plusieurs messages en peu de temps. Réessayez dans quelques minutes.",
      values,
    };
  }

  const { name, email, message } = parsed.data;
  try {
    const mailer = deps.mailer ?? createSmtpMailer(deps.config);
    await mailer.sendMail({
      from: { name: `Formulaire de contact ${site.name}`, address: deps.config.from },
      to: deps.config.to,
      replyTo: { name, address: email },
      subject: `[${site.name}] Message de ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    });
  } catch (error) {
    console.error("[contact] sending failed:", error);
    return {
      status: "error",
      message: "Impossible d’envoyer votre message. Réessayez plus tard ou écrivez-nous par e-mail.",
      values,
    };
  }

  return { status: "success", message: SENT_MESSAGE };
}
