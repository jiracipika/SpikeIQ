"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_REGIONS, type RiotRegion } from "@/lib/riot/regions";
import { lookupSummoner } from "@/app/actions/riot";

export function SummonerLookupForm() {
  const [summonerName, setSummonerName] = useState("");
  const [region, setRegion] = useState<RiotRegion>("na1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    name: string;
    level: number;
    puuid: string;
  } | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const res = await lookupSummoner(summonerName, region);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.summoner) {
      setResult(res.summoner);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Try with your summoner name</CardTitle>
        <CardDescription>
          Enter your summoner name to see your real stats (API key powered).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Summoner name..."
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="flex-1"
            />
            <Select value={region} onValueChange={(v) => setRegion(v as RiotRegion)} disabled={loading}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading || !summonerName.trim()}>
              <Search className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          {result && (
            <div className="rounded-md border border-success/30 bg-success/5 p-3 text-sm">
              <p className="font-medium text-foreground">
                {result.name}
                <span className="ml-1 text-xs text-muted-foreground">Level {result.level}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PUUID: {result.puuid}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Found! Next step: we'd sync your match history and build your analytics.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
