import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";
type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-[#ff7a86] bg-[#ff4655] text-white shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_10px_26px_rgba(255,70,85,0.32)] hover:bg-[#ff5b69] active:translate-y-px",
  secondary:
    "border border-[#2a3a56] bg-[#0f1923] text-[#dfe7f5] shadow-[0_8px_18px_rgba(0,0,0,0.28)] hover:border-[#3c567e] hover:bg-[#142233]",
  ghost: "border border-transparent bg-transparent text-foreground hover:border-border hover:bg-muted/50",
  outline: "border border-[#4c688f] bg-transparent text-[#d5e4ff] hover:bg-[#1a2a3e]/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-11 px-6 text-sm",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button };
