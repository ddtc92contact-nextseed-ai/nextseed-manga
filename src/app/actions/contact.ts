"use server";

import { headers } from "next/headers";

import type { ContactState } from "@/server/contact";
import { getSmtpConfig, handleContactSubmission } from "@/server/contact";
import { clientIp, createRateLimiter } from "@/server/rate-limit";

// 5 messages per IP every 15 minutes.
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return handleContactSubmission(formData, {
    ip: clientIp(await headers()),
    config: getSmtpConfig(),
    limiter,
  });
}
