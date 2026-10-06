/** A newsletter service that can add an email address to the mailing list. */
export type NewsletterProvider = {
  name: string;
  /** Resolves once the address is subscribed (or already was); throws on failure. */
  subscribe: (email: string) => Promise<void>;
};
