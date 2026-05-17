import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-card hover:bg-[color:var(--accent-strong)]",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--ink)] hover:bg-slate-50",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-slate-100",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
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
          "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          variantMap[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
