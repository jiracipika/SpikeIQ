import { createClient } from "@supabase/supabase-js";
import { createValorantProvider } from "../provider";
import { ValorantIngestionWorker } from "./worker";

export async function runValorantWorkerOnce(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const providerMode = (process.env.VAL_PROVIDER ?? "mock") as "live" | "mock";
  const riotApiKey = process.env.RIOT_API_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const provider = createValorantProvider({
    mode: providerMode,
    supabase,
    riotApiKey,
  });

  const worker = new ValorantIngestionWorker(supabase, provider);
  await worker.runOnce({
    workerId: process.env.WORKER_ID ?? `valorant-worker-${process.pid}`,
    maxJobs: Number(process.env.WORKER_BATCH_SIZE ?? "10"),
  });
}
