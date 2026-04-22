import { SupabaseClient } from "@supabase/supabase-js";
import { ValorantIngestionService } from "../ingestion/service";
import { MOCK_PUUID } from "./fixtures";

export async function seedMockValorantPipeline(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const service = new ValorantIngestionService(supabase);

  await service.onRiotLinked({
    userId,
    puuid: MOCK_PUUID,
    region: "na",
    gameName: "MockUser",
    tagLine: "SPIKE",
    scopes: ["openid", "offline_access"],
    optInVersion: "v1",
  });
}
