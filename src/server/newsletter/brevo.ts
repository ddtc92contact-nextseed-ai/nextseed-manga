import type { NewsletterProvider } from "./types";

export const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

/** Brevo (ex-Sendinblue) adapter: upserts the contact into one list. */
export function createBrevoProvider({
  apiKey,
  listId,
  fetchImpl = fetch,
}: {
  apiKey: string;
  listId: number;
  fetchImpl?: typeof fetch;
}): NewsletterProvider {
  return {
    name: "brevo",
    async subscribe(email) {
      const res = await fetchImpl(BREVO_CONTACTS_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        // updateEnabled: an existing contact is added to the list instead of failing.
        body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Brevo responded ${res.status}: ${detail.slice(0, 200)}`);
      }
    },
  };
}
