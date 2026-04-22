"use client";

import { useState, useTransition } from "react";
import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_REGIONS, type RiotRegion } from "@/lib/riot/regions";

interface RiotConnectFormProps {
  defaultRegion: RiotRegion;
  mock?: boolean;
}

/**
 * Region picker + "Authorize with Riot" button.
 *
 * Submits a plain GET to `/api/riot/connect` so it still works without JS,
 * but shows a pending spinner while the browser navigates to Riot.
 */
export function RiotConnectForm({ defaultRegion, mock }: RiotConnectFormProps) {
  const [region, setRegion] = useState<RiotRegion>(defaultRegion);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action="/api/riot/connect"
      method="get"
      onSubmit={() => startTransition(() => {})}
      className="grid gap-3 sm:grid-cols-[1fr_auto]"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="region"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Region
        </label>
        <select
          id="region"
          name="region"
          value={region}
          onChange={(event) => setRegion(event.target.value as RiotRegion)}
          className="focus-ring h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
        >
          {SUPPORTED_REGIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <Button type="submit" size="lg" className="w-full shadow-glow sm:w-auto" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          {mock ? "Authorize with Riot (demo)" : "Authorize with Riot"}
        </Button>
      </div>
    </form>
  );
}
