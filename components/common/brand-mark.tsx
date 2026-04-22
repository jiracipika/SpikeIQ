import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  showText?: boolean;
}

export function BrandMark({ className, showText = true }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary shadow-glow"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4 L12 20 L20 4" />
          <path d="M8 4 L12 12 L16 4" opacity="0.5" />
        </svg>
      </span>
      {showText ? (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Spike<span className="text-primary">IQ</span>
        </span>
      ) : null}
    </div>
  );
}
