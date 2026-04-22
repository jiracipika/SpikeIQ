import { MOCK_MATCHES, MOCK_MATCH_IDS, MOCK_PUUID } from "../mock/fixtures";
import {
  AccountIdentity,
  MatchlistQueryOptions,
  MatchlistResponse,
  RawMatchPayload,
  ValorantMatchProvider,
  ValorantRegion,
} from "./types";

export class MockRiotProvider implements ValorantMatchProvider {
  async getAccountMe(_accessToken: string, _accountRoute?: "americas" | "europe" | "asia"): Promise<AccountIdentity> {
    return {
      puuid: MOCK_PUUID,
      gameName: "MockUser",
      tagLine: "SPIKE",
    };
  }

  async getMatchlist(
    _region: ValorantRegion,
    puuid: string,
    options: MatchlistQueryOptions = {},
  ): Promise<MatchlistResponse> {
    const startIndex = Math.max(0, options.startIndex ?? 0);
    const endIndex = Math.max(startIndex, options.endIndex ?? MOCK_MATCH_IDS.length - 1);
    const pagedIds = MOCK_MATCH_IDS.slice(startIndex, endIndex + 1);

    return {
      puuid,
      history: [...pagedIds].map((matchId, index) => ({
        matchId,
        queueId: "competitive",
        gameStartTimeMillis: Date.now() - (startIndex + index) * 1000 * 60 * 45,
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
