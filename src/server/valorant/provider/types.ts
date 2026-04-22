export type ValorantRegion = "na" | "latam" | "br" | "eu" | "ap" | "kr" | "esports";

export interface AccountIdentity {
  puuid: string;
  gameName?: string;
  tagLine?: string;
}

export interface MatchlistEntry {
  matchId: string;
  queueId?: string;
  gameStartTimeMillis?: number;
}

export interface MatchlistResponse {
  puuid: string;
  history: MatchlistEntry[];
}

export interface MatchlistQueryOptions {
  startIndex?: number;
  endIndex?: number;
  startTimeMillis?: number;
  endTimeMillis?: number;
  queue?: string;
}

export interface RawMatchPlayerStats {
  score?: number;
  roundsPlayed?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  playtimeMillis?: number;
  damage?: {
    dealt?: number;
    received?: number;
  };
}

export interface RawMatchPlayer {
  puuid: string;
  teamId?: string;
  characterId?: string;
  stats?: RawMatchPlayerStats;
  competitiveTier?: number;
}

export interface RawRoundResultPlayerStats {
  puuid: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  score?: number;
  damage?: number;
  economy?: {
    loadoutValue?: number;
    spent?: number;
    remaining?: number;
  };
}

export interface RawRoundResult {
  roundNum: number;
  roundResult?: string;
  roundCeremony?: string;
  winningTeam?: string;
  bombPlanter?: string;
  bombDefuser?: string;
  plantRoundTime?: number;
  defuseRoundTime?: number;
  playerStats?: RawRoundResultPlayerStats[];
}

export interface RawMatchTeam {
  teamId: string;
  won?: boolean;
  roundsWon?: number;
  roundsPlayed?: number;
}

export interface RawMatchPayload {
  matchInfo?: {
    matchId?: string;
    mapId?: string;
    queueId?: string;
    gameStartMillis?: number;
    gameLengthMillis?: number;
    seasonId?: string;
    gameVersion?: string;
    provisioningFlowId?: string;
  };
  players?: RawMatchPlayer[];
  teams?: RawMatchTeam[];
  roundResults?: RawRoundResult[];
}

export interface ProviderCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export interface ValorantMatchProvider {
  getAccountMe(accessToken: string, accountRoute?: "americas" | "europe" | "asia"): Promise<AccountIdentity>;
  getMatchlist(region: ValorantRegion, puuid: string, options?: MatchlistQueryOptions): Promise<MatchlistResponse>;
  getMatch(region: ValorantRegion, matchId: string): Promise<RawMatchPayload>;
}
