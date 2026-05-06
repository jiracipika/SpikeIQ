export type MatchResult = "win" | "loss";

export type Role = "duelist" | "initiator" | "controller" | "sentinel";

export type Side = "attack" | "defense";

export type RoundBuyType = "pistol" | "eco" | "force" | "full-buy" | "bonus";

export type RoundHighlight =
  | "first-blood"
  | "clutch"
  | "ace"
  | "triple-kill"
  | "retake"
  | "save"
  | "thrifty";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  tagline: string;
  region: "NA" | "EU" | "AP";
  accountLinked: boolean;
  avatarUrl?: string;
}

export interface DashboardOverview {
  rankLabel: string;
  rankTier: string;
  rr: number;
  totalMatches: number;
  winRate: number;
  avgCombatScore: number;
  kdRatio: number;
  headshotPercentage: number;
  /** Percentage point delta vs previous window (can be negative). */
  winRateDelta?: number;
  acsDelta?: number;
  kdDelta?: number;
  hsDelta?: number;
  peakRank?: string;
  /** 0–100 progress toward next tier, useful for progress rings. */
  rankProgress?: number;
}

export interface Kda {
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchPerformance {
  combatScore: number;
  econRating: number;
  firstBloods: number;
  plants: number;
  defuses: number;
}

export interface MatchAdvancedAnalysis {
  sample: {
    rounds: number;
  };
  combatVolume: {
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    killsPerRound: number;
    deathsPerRound: number;
    assistsPerRound: number;
    impactPerRound: number;
    killParticipationProxy: number;
  };
  openingDuels: {
    attempted: number;
    won: number;
    lost: number;
    noContactRounds: number;
    winRate: number;
    roundWinRateAfterFirstBlood: number;
    roundWinRateAfterFirstDeath: number;
    conversionDelta: number;
  };
  combatConsistency: {
    multiKillRounds: number;
    multiKillRate: number;
    twoKPlusRounds: number;
    threeKPlusRounds: number;
    fourKPlusRounds: number;
    aceRounds: number;
    deathlessRounds: number;
    deathlessRate: number;
    zeroKillDeathRounds: number;
    zeroKillDeathRate: number;
    avgKillsPerRound: number;
    killStdDev: number;
    impactStdDev: number;
    highImpactRounds: number;
    lowImpactRounds: number;
  };
  conversion: {
    roundWinRateWhen2PlusKills: number;
    roundWinRateWhen0Kills: number;
    roundWinRateWhenDeathless: number;
    roundWinRateWhenDied: number;
    closeRoundRecord: string;
  };
  sidePerformance: {
    attackRounds: number;
    attackWinRate: number;
    attackKd: number;
    attackOpeningWinRate: number;
    attackOpeningDeathRate: number;
    defenseRounds: number;
    defenseWinRate: number;
    defenseKd: number;
    defenseOpeningWinRate: number;
    defenseOpeningDeathRate: number;
  };
  buyProfile: {
    pistolRounds: number;
    pistolWinRate: number;
    ecoRounds: number;
    ecoWinRate: number;
    forceRounds: number;
    forceWinRate: number;
    fullBuyRounds: number;
    fullBuyWinRate: number;
    bonusRounds: number;
    bonusWinRate: number;
  };
  utilityImpact: {
    assists: number;
    assistsPerRound: number;
    assistRounds: number;
    assistRoundRate: number;
    supportRate: number;
    plants: number;
    defuses: number;
    objectiveActions: number;
  };
  clutchImpact: {
    clutchRounds: number;
    clutchRate: number;
  };
  tradeProxy: {
    tradedDeathRounds: number;
    tradedDeathRate: number;
    untradedDeathRounds: number;
    untradedDeathRate: number;
  };
  preAimProxy: {
    headshotPercent: number;
    firstDeathRate: number;
    openingDeathRate: number;
    cleanOpeningRate: number;
  };
  momentum: {
    longestWinStreak: number;
    longestLossStreak: number;
    bounceBackWins: number;
    bounceBackChances: number;
    bounceBackRate: number;
  };
  tips: string[];
  dataNotes: string[];
}

export interface MatchRound {
  roundNumber: number;
  winner: "player" | "enemy";
  side: Side;
  buyType: RoundBuyType;
  playerKills: number;
  playerDied: boolean;
  highlight?: RoundHighlight;
}

export interface MatchHighlight {
  roundNumber: number;
  label: string;
  description: string;
  kind: "best" | "worst";
}

export interface PerformanceBenchmark {
  metric: "acs" | "kd" | "hsPercentage" | "firstBloods";
  label: string;
  playerValue: number;
  averageValue: number;
  unit?: "percent" | "count" | "ratio";
}

export interface ValorantMatch {
  id: string;
  playedAtIso: string;
  queue: "competitive" | "unrated" | "premier";
  map: string;
  agent: string;
  role: Role;
  result: MatchResult;
  scoreline: string;
  kda: Kda;
  hsPercentage: number;
  performance: MatchPerformance;
  /** Optional deep data surfaced on match detail page. */
  rounds?: MatchRound[];
  highlights?: MatchHighlight[];
  benchmarks?: PerformanceBenchmark[];
  analysis?: MatchAdvancedAnalysis;
  durationMinutes?: number;
}

export interface WinRateTrendPoint {
  dayLabel: string;
  winRate: number;
  avgAcs: number;
}

export interface AgentPerformance {
  agent: string;
  role: Role;
  matches: number;
  winRate: number;
  kdRatio: number;
  avgAcs: number;
}

export interface MapPerformance {
  map: string;
  matches: number;
  winRate: number;
  attackRoundWinRate: number;
  defenseRoundWinRate: number;
}

export interface CoachingInsight {
  id: string;
  title: string;
  category: "mechanics" | "macro" | "consistency" | "mindset";
  priority: "high" | "medium" | "low";
  description: string;
  action: string;
}

export interface UserSettings {
  preferredRole: Role;
  preferredAgents: string[];
  profileVisibility: "private" | "friends" | "public";
  emailUpdates: boolean;
  /** Toggle for weekly performance recap email. */
  weeklyRecap?: boolean;
  /** Toggle for auto-sync match data. */
  autoSync?: boolean;
}
