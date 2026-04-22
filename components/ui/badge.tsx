import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-muted text-muted-foreground",
  success: "border-success/40 bg-success/20 text-success",
  warning: "border-warning/40 bg-warning/20 text-warning",
  danger: "border-danger/40 bg-danger/20 text-danger",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
