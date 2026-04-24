"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Search, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SUPPORTED_REGIONS, type RiotRegion } from "@/lib/riot/regions";
import { lookupPlayerWithStats } from "@/app/actions/riot";
import { type ValorantMatchSummary, VALORANT_TIER_NAMES } from "@/lib/riot/api";

type PlayerResult = {
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  puuid: string;
  matches: ValorantMatchSummary[];
};

function kda(kills: number, deaths: number, assists: number) {
  if (deaths === 0) return ((kills + assists) / 1).toFixed(2);
  return ((kills + assists) / deaths).toFixed(2);
}

function queueLabel(queue: string) {
  const map: Record<string, string> = {
    competitive: "Ranked",
    unrated: "Unrated",
    spikerush: "Spike Rush",
    deathmatch: "Deathmatch",
    ggteam: "Escalation",
    onefa: "Replication",
    snowball: "Snowball Fight",
    custom: "Custom",
  };
  return map[queue] ?? queue;
}

function MatchRow({ m }: { m: ValorantMatchSummary }) {
  const date = new Date(m.gameStartMillis).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
      <span
        className={`w-6 shrink-0 text-center text-xs font-bold ${
          m.won === null ? "text-muted-foreground" : m.won ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {m.won === null ? "–" : m.won ? "W" : "L"}
      </span>

      <span className="w-20 shrink-0 font-medium">{m.map}</span>

      <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">
        {m.agent}
      </span>

      <span className="w-20 shrink-0 text-center font-mono text-xs">
        {m.roundsWon} – {m.roundsLost}
      </span>

      <span className="w-16 shrink-0 text-center font-mono">
        {m.kills}/{m.deaths}/{m.assists}
      </span>

      <span className="w-10 shrink-0 text-center font-mono text-xs text-amber-400">
        {m.acs}
      </span>

      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{date}</span>
    </div>
  );
}

function StatsPanel({ result }: { result: PlayerResult }) {
  const { matches } = result;

  if (matches.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        No recent VALORANT matches found for this account.
      </p>
    );
  }

  const decided = matches.filter((m) => m.won !== null);
  const wins = decided.filter((m) => m.won).length;
  const avgAcs = Math.round(matches.reduce((s, m) => s + m.acs, 0) / matches.length);
  const avgKda =
    matches.reduce(
      (s, m) => s + (m.deaths === 0 ? m.kills + m.assists : (m.kills + m.assists) / m.deaths),
      0,
    ) / matches.length;
  const topTier = matches.find((m) => m.competitiveTier > 0)?.competitiveTier ?? 0;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col rounded-md border border-border bg-muted/30 px-3 py-2 text-center">
          <span className="text-lg font-bold text-foreground">
            {decided.length > 0 ? `${wins}W ${decided.length - wins}L` : "–"}
          </span>
          <span className="text-xs text-muted-foreground">Last {matches.length} games</span>
        </div>
        <div className="flex flex-col rounded-md border border-border bg-muted/30 px-3 py-2 text-center">
          <span className="text-lg font-bold text-amber-400">{avgAcs}</span>
          <span className="text-xs text-muted-foreground">Avg ACS</span>
        </div>
        <div className="flex flex-col rounded-md border border-border bg-muted/30 px-3 py-2 text-center">
          <span className="text-lg font-bold text-foreground">{avgKda.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">Avg KDA</span>
        </div>
        {topTier > 0 && (
          <div className="flex flex-col rounded-md border border-border bg-muted/30 px-3 py-2 text-center">
            <span className="text-lg font-bold text-violet-400">
              {VALORANT_TIER_NAMES[topTier] ?? `Tier ${topTier}`}
            </span>
            <span className="text-xs text-muted-foreground">Rank</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-3 px-3 text-xs font-semibold text-muted-foreground">
          <span className="w-6 shrink-0" />
          <span className="w-20 shrink-0">Map</span>
          <span className="w-16 shrink-0">Agent</span>
          <span className="w-20 shrink-0 text-center">Score</span>
          <span className="w-16 shrink-0 text-center">K/D/A</span>
          <span className="w-10 shrink-0 text-center">ACS</span>
          <span className="ml-auto shrink-0">Date</span>
        </div>
        {matches.map((m) => (
          <MatchRow key={m.matchId} m={m} />
        ))}
      </div>
    </div>
  );
}

export function SummonerLookupForm() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState<RiotRegion>("NA");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlayerResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      setError("Enter your player name");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await lookupPlayerWithStats(gameName, tagLine, region);
      if ("error" in data) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to look up player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Player name (e.g., Tenz)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Input
          placeholder="Tag (e.g., 123)"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          disabled={loading}
          className="w-20"
          maxLength={5}
        />
        <Select value={region} onValueChange={(v) => setRegion(v as RiotRegion)}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart2 className="h-4 w-4" />
          )}
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">PLAYER FOUND</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {result.gameName}
                <span className="ml-1 font-mono text-muted-foreground">#{result.tagLine}</span>
              </span>
              <Badge variant="success">Account Level {result.summonerLevel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              PUUID: <span className="font-mono">{result.puuid.slice(0, 12)}...</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Region: <span className="font-medium">{region}</span>
            </p>
          </div>

          <StatsPanel result={result} />
        </div>
      )}
    </form>
  );
}
