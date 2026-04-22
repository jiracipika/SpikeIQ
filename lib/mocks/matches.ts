import type {
  MatchHighlight,
  MatchRound,
  PerformanceBenchmark,
  RoundBuyType,
  RoundHighlight,
  Side,
  ValorantMatch,
} from "@/types/domain";

/**
 * Deterministic pseudo-random from a seed so the mock round timeline is stable
 * between server and client renders (no hydration mismatch).
 */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

function buildRounds(matchId: string, scoreline: string, playerStartsAttack = true): MatchRound[] {
  const [a, b] = scoreline.split("-").map((n) => parseInt(n, 10));
  const totalPlayerWins = a;
  const totalEnemyWins = b;
  const total = totalPlayerWins + totalEnemyWins;
  const rng = seeded(
    Array.from(matchId).reduce((acc, char) => acc + char.charCodeAt(0), 0),
  );

  // Distribute wins randomly but deterministically.
  const outcomes: ("player" | "enemy")[] = [];
  let pLeft = totalPlayerWins;
  let eLeft = totalEnemyWins;
  for (let i = 0; i < total; i += 1) {
    if (pLeft === 0) {
      outcomes.push("enemy");
      eLeft -= 1;
    } else if (eLeft === 0) {
      outcomes.push("player");
      pLeft -= 1;
    } else {
      const playerWins = rng() < pLeft / (pLeft + eLeft);
      outcomes.push(playerWins ? "player" : "enemy");
      if (playerWins) pLeft -= 1;
      else eLeft -= 1;
    }
  }

  const buyTypes: RoundBuyType[] = ["pistol", "eco", "force", "full-buy", "bonus"];
  const highlightsPool: RoundHighlight[] = ["first-blood", "clutch", "triple-kill", "retake", "save"];

  return outcomes.map((winner, idx) => {
    const roundNumber = idx + 1;
    const firstHalf = idx < 12;
    const attackSideFirst: Side = playerStartsAttack ? "attack" : "defense";
    const attackSideSecond: Side = playerStartsAttack ? "defense" : "attack";
    const side = firstHalf ? attackSideFirst : attackSideSecond;

    let buyType: RoundBuyType;
    if (roundNumber === 1 || roundNumber === 13) buyType = "pistol";
    else if (roundNumber === 2 || roundNumber === 14) buyType = "eco";
    else buyType = buyTypes[Math.floor(rng() * buyTypes.length)];

    const playerKills = winner === "player" ? Math.floor(rng() * 3) + (rng() > 0.6 ? 1 : 0) : Math.floor(rng() * 2);
    const playerDied = rng() > 0.38 || winner === "enemy";
    const highlight =
      rng() > 0.82 ? highlightsPool[Math.floor(rng() * highlightsPool.length)] : undefined;

    return {
      roundNumber,
      winner,
      side,
      buyType,
      playerKills,
      playerDied,
      highlight,
    };
  });
}

function buildBenchmarks(
  match: Pick<ValorantMatch, "performance" | "kda" | "hsPercentage">,
): PerformanceBenchmark[] {
  const kd = match.kda.deaths === 0 ? match.kda.kills : match.kda.kills / match.kda.deaths;
  return [
    {
      metric: "acs",
      label: "Combat Score",
      playerValue: match.performance.combatScore,
      averageValue: 221,
      unit: "count",
    },
    {
      metric: "kd",
      label: "K/D Ratio",
      playerValue: Math.round(kd * 100) / 100,
      averageValue: 1.04,
      unit: "ratio",
    },
    {
      metric: "hsPercentage",
      label: "Headshot %",
      playerValue: match.hsPercentage,
      averageValue: 24.2,
      unit: "percent",
    },
    {
      metric: "firstBloods",
      label: "First Bloods",
      playerValue: match.performance.firstBloods,
      averageValue: 2,
      unit: "count",
    },
  ];
}

function buildHighlights(matchId: string): MatchHighlight[] {
  const rng = seeded(
    Array.from(matchId).reduce((acc, char) => acc + char.charCodeAt(0), 0) + 7,
  );
  const bestRound = Math.floor(rng() * 24) + 1;
  let worstRound = Math.floor(rng() * 24) + 1;
  if (worstRound === bestRound) worstRound = (worstRound % 24) + 1;

  const bestDescriptions = [
    "Triple kill on retake sealed mid control",
    "1v3 clutch on defuse after teammate trades",
    "Opening pick into disciplined default",
    "Utility chain broke the enemy execute",
  ];
  const worstDescriptions = [
    "Greedy peek on default gave up first contact",
    "Crossfire broke early, got traded instantly",
    "Late rotate left the site unsupported",
    "Low economy push with no utility cover",
  ];

  return [
    {
      roundNumber: bestRound,
      kind: "best",
      label: `Round ${bestRound} · Best round`,
      description: bestDescriptions[Math.floor(rng() * bestDescriptions.length)],
    },
    {
      roundNumber: worstRound,
      kind: "worst",
      label: `Round ${worstRound} · Worst round`,
      description: worstDescriptions[Math.floor(rng() * worstDescriptions.length)],
    },
  ];
}

const baseMatches: Omit<ValorantMatch, "rounds" | "highlights" | "benchmarks" | "durationMinutes">[] = [
  {
    id: "match_923101",
    playedAtIso: "2026-04-21T22:11:00.000Z",
    queue: "competitive",
    map: "Ascent",
    agent: "Sova",
    role: "initiator",
    result: "win",
    scoreline: "13-9",
    kda: { kills: 22, deaths: 14, assists: 9 },
    hsPercentage: 28.4,
    performance: { combatScore: 261, econRating: 85, firstBloods: 4, plants: 1, defuses: 0 },
  },
  {
    id: "match_923102",
    playedAtIso: "2026-04-20T20:43:00.000Z",
    queue: "competitive",
    map: "Sunset",
    agent: "Skye",
    role: "initiator",
    result: "loss",
    scoreline: "10-13",
    kda: { kills: 17, deaths: 18, assists: 11 },
    hsPercentage: 24.2,
    performance: { combatScore: 212, econRating: 73, firstBloods: 2, plants: 0, defuses: 1 },
  },
  {
    id: "match_923103",
    playedAtIso: "2026-04-19T18:27:00.000Z",
    queue: "competitive",
    map: "Bind",
    agent: "KAY/O",
    role: "initiator",
    result: "win",
    scoreline: "13-7",
    kda: { kills: 20, deaths: 12, assists: 8 },
    hsPercentage: 31.1,
    performance: { combatScore: 249, econRating: 81, firstBloods: 3, plants: 2, defuses: 0 },
  },
  {
    id: "match_923104",
    playedAtIso: "2026-04-18T22:02:00.000Z",
    queue: "competitive",
    map: "Lotus",
    agent: "Sova",
    role: "initiator",
    result: "loss",
    scoreline: "11-13",
    kda: { kills: 15, deaths: 17, assists: 10 },
    hsPercentage: 26.8,
    performance: { combatScore: 197, econRating: 69, firstBloods: 1, plants: 0, defuses: 0 },
  },
  {
    id: "match_923105",
    playedAtIso: "2026-04-17T21:31:00.000Z",
    queue: "competitive",
    map: "Haven",
    agent: "Sova",
    role: "initiator",
    result: "win",
    scoreline: "13-11",
    kda: { kills: 24, deaths: 16, assists: 12 },
    hsPercentage: 30.3,
    performance: { combatScore: 279, econRating: 89, firstBloods: 5, plants: 1, defuses: 1 },
  },
  {
    id: "match_923106",
    playedAtIso: "2026-04-16T19:10:00.000Z",
    queue: "competitive",
    map: "Icebox",
    agent: "Gekko",
    role: "initiator",
    result: "win",
    scoreline: "13-8",
    kda: { kills: 18, deaths: 13, assists: 14 },
    hsPercentage: 27.6,
    performance: { combatScore: 228, econRating: 78, firstBloods: 2, plants: 2, defuses: 0 },
  },
];

export const mockMatches: ValorantMatch[] = baseMatches.map((match, index) => ({
  ...match,
  durationMinutes: 34 + (index % 4) * 3,
  rounds: buildRounds(match.id, match.scoreline, index % 2 === 0),
  highlights: buildHighlights(match.id),
  benchmarks: buildBenchmarks(match),
}));
