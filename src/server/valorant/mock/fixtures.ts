import { RawMatchPayload } from "../provider/types";

export const MOCK_PUUID = "mock-player-puuid-1";

export const MOCK_MATCH_IDS = ["mock-match-001", "mock-match-002", "mock-match-003"] as const;

export const MOCK_MATCHES: Record<string, RawMatchPayload> = {
  "mock-match-001": {
    matchInfo: {
      matchId: "mock-match-001",
      mapId: "Ascent",
      queueId: "competitive",
      gameStartMillis: Date.now() - 1000 * 60 * 60 * 24,
      gameLengthMillis: 2_180_000,
      seasonId: "episode8-act3",
    },
    teams: [
      { teamId: "Blue", won: true, roundsWon: 13, roundsPlayed: 22 },
      { teamId: "Red", won: false, roundsWon: 9, roundsPlayed: 22 },
    ],
    players: [
      {
        puuid: MOCK_PUUID,
        teamId: "Blue",
        characterId: "Sova",
        stats: {
          score: 318,
          roundsPlayed: 22,
          kills: 20,
          deaths: 14,
          assists: 8,
          damage: { dealt: 3610, received: 2920 },
        },
      },
    ],
    roundResults: buildRounds(22, "Blue", MOCK_PUUID),
  },
  "mock-match-002": {
    matchInfo: {
      matchId: "mock-match-002",
      mapId: "Bind",
      queueId: "competitive",
      gameStartMillis: Date.now() - 1000 * 60 * 60 * 48,
      gameLengthMillis: 2_050_000,
      seasonId: "episode8-act3",
    },
    teams: [
      { teamId: "Blue", won: false, roundsWon: 10, roundsPlayed: 24 },
      { teamId: "Red", won: true, roundsWon: 14, roundsPlayed: 24 },
    ],
    players: [
      {
        puuid: MOCK_PUUID,
        teamId: "Blue",
        characterId: "Killjoy",
        stats: {
          score: 254,
          roundsPlayed: 24,
          kills: 15,
          deaths: 18,
          assists: 10,
          damage: { dealt: 2840, received: 3480 },
        },
      },
    ],
    roundResults: buildRounds(24, "Red", MOCK_PUUID),
  },
  "mock-match-003": {
    matchInfo: {
      matchId: "mock-match-003",
      mapId: "Lotus",
      queueId: "competitive",
      gameStartMillis: Date.now() - 1000 * 60 * 60 * 72,
      gameLengthMillis: 1_920_000,
      seasonId: "episode8-act3",
    },
    teams: [
      { teamId: "Blue", won: true, roundsWon: 13, roundsPlayed: 19 },
      { teamId: "Red", won: false, roundsWon: 6, roundsPlayed: 19 },
    ],
    players: [
      {
        puuid: MOCK_PUUID,
        teamId: "Blue",
        characterId: "Omen",
        stats: {
          score: 296,
          roundsPlayed: 19,
          kills: 18,
          deaths: 11,
          assists: 6,
          damage: { dealt: 3200, received: 2140 },
        },
      },
    ],
    roundResults: buildRounds(19, "Blue", MOCK_PUUID),
  },
};

function buildRounds(totalRounds: number, winningTeam: "Blue" | "Red", puuid: string) {
  return Array.from({ length: totalRounds }, (_, i) => {
    const roundNum = i + 1;
    const blueWon = roundNum % 3 !== 0;
    const winner = blueWon ? "Blue" : "Red";

    return {
      roundNum,
      roundResult: winner === winningTeam ? "BombDefused" : "Eliminated",
      winningTeam: winner,
      bombPlanter: roundNum % 5 === 0 ? puuid : undefined,
      bombDefuser: roundNum % 7 === 0 ? puuid : undefined,
      playerStats: [
        {
          puuid,
          kills: roundNum % 4 === 0 ? 2 : 1,
          deaths: roundNum % 3 === 0 ? 1 : 0,
          assists: roundNum % 5 === 0 ? 1 : 0,
          damage: 110 + (roundNum % 3) * 35,
          economy: {
            loadoutValue: 3_900,
            spent: 4_400,
            remaining: 900,
          },
        },
      ],
    };
  });
}
