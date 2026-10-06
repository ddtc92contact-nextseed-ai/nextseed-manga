/** Shape returned by the contact & newsletter server actions to their forms. */
export type FormState<Field extends string = string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
  /** Submitted values echoed back so a failed submit doesn't wipe the form. */
  values?: Partial<Record<Field, string>>;
};

export const idleState: FormState = { status: "idle" };

export function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Env-like map (process.env in the app, a plain object in tests). */
export type Env = Record<string, string | undefined>;
