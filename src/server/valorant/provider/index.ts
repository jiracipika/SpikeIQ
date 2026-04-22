import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseProviderCache } from "../ingestion/supabase-cache";
import { LiveRiotProvider } from "./live-riot";
import { MockRiotProvider } from "./mock-riot";
import { ValorantMatchProvider } from "./types";

export interface ProviderFactoryOptions {
  mode: "live" | "mock";
  supabase?: SupabaseClient;
  riotApiKey?: string;
}

export function createValorantProvider(options: ProviderFactoryOptions): ValorantMatchProvider {
  if (options.mode === "mock") {
    return new MockRiotProvider();
  }

  if (!options.riotApiKey) {
    throw new Error("riotApiKey is required when VAL_PROVIDER=live");
  }

  const cache = options.supabase ? new SupabaseProviderCache(options.supabase, "riot-live") : undefined;

  return new LiveRiotProvider({
    apiKey: options.riotApiKey,
    cache,
  });
}
