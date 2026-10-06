import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Centered, max-width wrapper with the site gutters. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-site px-gutter lg:px-gutter-lg ${className}`}
    >
      {children}
    </div>
  );
}
