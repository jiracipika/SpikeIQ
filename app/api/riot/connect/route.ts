/**
 * Legacy alias for `/api/riot/start`.
 *
 * Kept for backward compatibility with existing forms/links while we migrate
 * to the clearer route naming.
 */

import { type NextRequest } from "next/server";
import { startRiotOAuth } from "@/lib/riot/handlers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return startRiotOAuth(request);
}
