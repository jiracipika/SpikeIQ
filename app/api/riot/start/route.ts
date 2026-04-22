import { type NextRequest } from "next/server";
import { startRiotOAuth } from "@/lib/riot/handlers";

export const dynamic = "force-dynamic";

/** Canonical Riot OAuth start endpoint. */
export async function GET(request: NextRequest) {
  return startRiotOAuth(request);
}
