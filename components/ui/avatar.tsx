import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({ initials, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex select-none items-center justify-center rounded-full border border-border bg-gradient-to-br from-primary/25 via-primary/10 to-accent font-semibold tracking-tight text-foreground",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      <span className="font-mono">{initials.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}
