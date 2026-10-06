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
    .min(1, "Please enter your email address.")
    .max(254, "This email address is too long.")
    .pipe(z.email("Please enter a valid email address.")),
});

export type NewsletterState = FormState<"email">;

export async function handleNewsletterSignup(
  formData: FormData,
  deps: { ip: string; provider: NewsletterProvider | null; limiter: RateLimiter },
): Promise<NewsletterState> {
  const values = { email: formString(formData, "email") };

  if (!deps.provider) {
    return { status: "error", message: "The newsletter isn’t available right now.", values };
  }

  const parsed = newsletterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  if (!deps.limiter.check(deps.ip)) {
    return {
      status: "error",
      message: "Too many attempts. Please try again in a few minutes.",
      values,
    };
  }

  try {
    await deps.provider.subscribe(parsed.data.email);
  } catch (error) {
    console.error(`[newsletter] ${deps.provider.name} signup failed:`, error);
    return {
      status: "error",
      message: "Something went wrong on our side. Please try again later.",
      values,
    };
  }

  return { status: "success", message: "You’re in! New chapters will land in your inbox." };
}
