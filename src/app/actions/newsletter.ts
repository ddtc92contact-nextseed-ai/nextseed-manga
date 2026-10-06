"use server";

import { headers } from "next/headers";

import type { NewsletterState } from "@/server/newsletter";
import { getNewsletterProvider, handleNewsletterSignup } from "@/server/newsletter";
import { clientIp, createRateLimiter } from "@/server/rate-limit";

// 5 signups per IP every 15 minutes.
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  return handleNewsletterSignup(formData, {
    ip: clientIp(await headers()),
    provider: getNewsletterProvider(),
    limiter,
  });
}
