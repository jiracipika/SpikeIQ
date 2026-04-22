/**
 * Legacy callback path kept for compatibility with previously configured Riot
 * redirect URIs. The canonical callback is `/api/riot/callback`.
 */

import { type NextRequest } from "next/server";
import { completeRiotOAuth } from "@/lib/riot/handlers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return completeRiotOAuth(request);
}
