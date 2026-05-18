import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong",
  secondary:
    "border border-border bg-white text-ink hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-ink hover:bg-accent-light",
  danger: "bg-danger text-white hover:opacity-90",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantMap[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
