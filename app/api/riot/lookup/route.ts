import { NextResponse, type NextRequest } from "next/server";
import { fetchPlayerByName, fetchValorantMatchStats } from "@/lib/riot/api";
import { isSupportedRegion } from "@/lib/riot/regions";

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = (process.env.MOBILE_ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((s) => s.trim());

function corsHeaders(origin: string | null): HeadersInit {
  const allow =
    ALLOWED_ORIGINS.includes("*") || (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin ?? "*"
      : ALLOWED_ORIGINS[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));
  const params = request.nextUrl.searchParams;

  const gameName = params.get("gameName")?.trim() ?? "";
  const tagLine = params.get("tagLine")?.replace(/^#/, "").trim() ?? "";
  const region = params.get("region")?.trim() ?? "";
  const countParam = params.get("count");
  const count = Math.min(Math.max(Number.parseInt(countParam ?? "5", 10) || 5, 1), 10);

  if (!gameName) {
    return NextResponse.json({ error: "Missing gameName" }, { status: 400, headers });
  }
  if (!isSupportedRegion(region)) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400, headers });
  }

  const player = await fetchPlayerByName(gameName, tagLine, region);
  if (!player) {
    return NextResponse.json(
      { error: `Player "${gameName}#${tagLine}" not found on ${region}` },
      { status: 404, headers },
    );
  }

  const matches = await fetchValorantMatchStats(player.puuid, region, count);
  return NextResponse.json({ player, matches }, { headers });
}
