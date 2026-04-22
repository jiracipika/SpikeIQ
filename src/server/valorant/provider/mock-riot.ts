import { MOCK_MATCHES, MOCK_MATCH_IDS, MOCK_PUUID } from "../mock/fixtures";
import { AccountIdentity, MatchlistResponse, RawMatchPayload, ValorantMatchProvider, ValorantRegion } from "./types";

export class MockRiotProvider implements ValorantMatchProvider {
  async getAccountMe(_accessToken: string, _accountRoute?: "americas" | "europe" | "asia"): Promise<AccountIdentity> {
    return {
      puuid: MOCK_PUUID,
      gameName: "MockUser",
      tagLine: "SPIKE",
    };
  }

  async getMatchlist(_region: ValorantRegion, puuid: string): Promise<MatchlistResponse> {
    return {
      puuid,
      history: [...MOCK_MATCH_IDS].map((matchId, index) => ({
        matchId,
        queueId: "competitive",
        gameStartTimeMillis: Date.now() - index * 1000 * 60 * 45,
      })),
    };
  }

  async getMatch(_region: ValorantRegion, matchId: string): Promise<RawMatchPayload> {
    const payload = MOCK_MATCHES[matchId];
    if (!payload) {
      throw new Error(`Mock match ${matchId} not found`);
    }

    return payload;
  }
}
