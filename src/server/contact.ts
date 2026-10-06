import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";

import { site } from "@/lib/site";

import type { FormState } from "./form-state";
import { type Env, formString } from "./form-state";
import type { RateLimiter } from "./rate-limit";

/** Name of the hidden anti-spam field: humans never see it, bots tend to fill it in. */
export const HONEYPOT_FIELD = "website";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us your name.")
    .max(100, "Please keep your name under 100 characters.")
    // Collapse whitespace (incl. newlines) so the name is safe in an email subject.
    .transform((v) => v.replace(/\s+/g, " ")),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "This email address is too long.")
    .pipe(z.email("Please enter a valid email address.")),
  message: z
    .string()
    .trim()
    .min(10, "Your message is a bit short (10 characters minimum).")
    .max(5000, "Please keep your message under 5000 characters."),
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
    return { status: "error", message: "The contact form is not available right now.", values };
  }

  // Honeypot filled: pretend it worked so bots don't learn anything.
  if (formString(formData, HONEYPOT_FIELD)) {
    return { status: "success", message: "Thanks! Your message is on its way." };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  if (!deps.limiter.check(deps.ip)) {
    return {
      status: "error",
      message: "You’ve sent several messages in a short time. Please try again in a few minutes.",
      values,
    };
  }

  const { name, email, message } = parsed.data;
  try {
    const mailer = deps.mailer ?? createSmtpMailer(deps.config);
    await mailer.sendMail({
      from: { name: `${site.name} contact form`, address: deps.config.from },
      to: deps.config.to,
      replyTo: { name, address: email },
      subject: `[${site.name}] Message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    });
  } catch (error) {
    console.error("[contact] sending failed:", error);
    return {
      status: "error",
      message: "Your message couldn’t be sent. Please try again later or reach out by email.",
      values,
    };
  }

  return { status: "success", message: "Thanks! Your message is on its way." };
}
