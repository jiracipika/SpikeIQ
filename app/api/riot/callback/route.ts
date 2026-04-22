import { type NextRequest } from "next/server";
import { completeRiotOAuth } from "@/lib/riot/handlers";

export const dynamic = "force-dynamic";

/** Canonical Riot OAuth callback endpoint. */
export async function GET(request: NextRequest) {
  return completeRiotOAuth(request);
}
