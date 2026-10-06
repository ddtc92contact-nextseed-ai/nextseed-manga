import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ink" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display uppercase tracking-wide transition-[transform,background-color,color,box-shadow] duration-150 active:translate-x-0.5 active:translate-y-0.5";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-ink-950 shadow-[4px_4px_0_0_var(--color-paper)] hover:bg-accent-strong hover:shadow-[6px_6px_0_0_var(--color-paper)]",
  ink: "bg-ink-950 text-paper shadow-[4px_4px_0_0_var(--color-paper)] hover:shadow-[6px_6px_0_0_var(--color-paper)]",
  outline:
    "border-2 border-paper text-paper hover:bg-paper hover:text-ink-950",
  ghost: "text-paper underline-offset-8 hover:text-accent hover:underline",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: Pick<CommonProps, "variant" | "size" | "className"> = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

/** Renders a Next.js <Link> when `href` is given, otherwise a <button>. */
export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  const classes = buttonClasses({ variant, size, className });

  if (rest.href !== undefined) {
    const linkProps = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link {...linkProps} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<
    ButtonAsButton,
    keyof CommonProps
  >;
  return (
    <button {...buttonProps} type={type} className={classes}>
      {children}
    </button>
  );
}
