import type { ComponentProps } from "react";

type BaseProps = {
  label: string;
  name: string;
  /** Validation messages for this field; the first one is shown. */
  errors?: string[];
  hint?: string;
  className?: string;
};

type InputFieldProps = BaseProps & { multiline?: false } & Omit<ComponentProps<"input">, "name" | "className">;
type TextareaFieldProps = BaseProps & { multiline: true } & Omit<ComponentProps<"textarea">, "name" | "className">;

export const fieldControlClasses =
  "block w-full border-2 border-ink-600 bg-ink-950 px-4 py-3 text-base text-paper placeholder:text-paper-faint transition-colors hover:border-paper-faint focus-visible:border-accent aria-invalid:border-accent";

/** Labelled input or textarea with an accessible inline error message. */
export function FormField(props: InputFieldProps | TextareaFieldProps) {
  const { label, name, errors, hint, className = "", id: idProp, multiline, ...rest } = props;
  const id = idProp ?? `field-${name}`;
  const error = errors?.[0];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const controlProps = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: fieldControlClasses,
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-paper-muted">
        {label}
        {rest.required && <span aria-hidden="true" className="text-accent"> *</span>}
      </label>
      {multiline ? (
        <textarea {...(rest as ComponentProps<"textarea">)} {...controlProps} />
      ) : (
        <input {...(rest as ComponentProps<"input">)} {...controlProps} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-paper-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
