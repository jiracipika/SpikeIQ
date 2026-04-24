"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
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
import { lookupPlayer } from "@/app/actions/riot";

export function SummonerLookupForm() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState<RiotRegion>("NA");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
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
      const data = await lookupPlayer(gameName, tagLine, region);
      if (data.error) {
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
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
        </div>
      )}
    </form>
  );
}
