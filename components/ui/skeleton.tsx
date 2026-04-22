import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-[linear-gradient(90deg,transparent,hsl(var(--muted-foreground)/0.12),transparent)]",
        className,
      )}
      {...props}
    />
  );
}
