import * as React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive";

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-muted/30 text-foreground",
  destructive: "border-danger/40 bg-danger/10 text-danger",
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative flex w-full items-start gap-2 rounded-md border px-3 py-2 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
