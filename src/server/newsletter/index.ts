import { z } from "zod";

import type { FormState } from "../form-state";
import { type Env, formString } from "../form-state";
import type { RateLimiter } from "../rate-limit";
import { createBrevoProvider } from "./brevo";
import type { NewsletterProvider } from "./types";

export type { NewsletterProvider } from "./types";

/**
 * The configured newsletter provider, or null when none is set up (the signup is then hidden).
 * To switch services, add an adapter next to brevo.ts and pick it here from its env vars.
 */
export function getNewsletterProvider(
  env: Env = process.env,
): NewsletterProvider | null {
  const apiKey = env.BREVO_API_KEY?.trim();
  const listId = Number(env.BREVO_LIST_ID?.trim());
  if (apiKey && Number.isInteger(listId) && listId > 0) {
    return createBrevoProvider({ apiKey, listId });
  }
  return null;
}

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Indiquez votre adresse e-mail.")
    .max(254, "Cette adresse e-mail est trop longue.")
    .pipe(z.email("Cette adresse e-mail n’est pas valide.")),
});

export type NewsletterState = FormState<"email">;

export async function handleNewsletterSignup(
  formData: FormData,
  deps: { ip: string; provider: NewsletterProvider | null; limiter: RateLimiter },
): Promise<NewsletterState> {
  const values = { email: formString(formData, "email") };

  if (!deps.provider) {
    return { status: "error", message: "La newsletter est indisponible pour le moment.", values };
  }

  const parsed = newsletterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez votre adresse e-mail.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  if (!deps.limiter.check(deps.ip)) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessayez dans quelques minutes.",
      values,
    };
  }

  try {
    await deps.provider.subscribe(parsed.data.email);
  } catch (error) {
    console.error(`[newsletter] ${deps.provider.name} signup failed:`, error);
    return {
      status: "error",
      message: "Un souci de notre côté. Réessayez un peu plus tard.",
      values,
    };
  }

  return { status: "success", message: "C’est noté\u00a0! Les nouveaux chapitres arriveront dans votre boîte mail." };
}
