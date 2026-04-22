import {
  AccountIdentity,
  MatchlistResponse,
  ProviderCache,
  RawMatchPayload,
  ValorantMatchProvider,
  ValorantRegion,
} from "./types";

const MATCH_BASE_BY_REGION: Record<ValorantRegion, string> = {
  na: "https://na.api.riotgames.com",
  latam: "https://latam.api.riotgames.com",
  br: "https://br.api.riotgames.com",
  eu: "https://eu.api.riotgames.com",
  ap: "https://ap.api.riotgames.com",
  kr: "https://kr.api.riotgames.com",
  esports: "https://esports.api.riotgames.com",
};

const ACCOUNT_BASE_BY_ROUTE = {
  americas: "https://americas.api.riotgames.com",
  europe: "https://europe.api.riotgames.com",
  asia: "https://asia.api.riotgames.com",
} as const;

export interface LiveRiotProviderOptions {
  apiKey: string;
  cache?: ProviderCache;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  timeoutMs?: number;
}

export class LiveRiotProvider implements ValorantMatchProvider {
  private readonly apiKey: string;
  private readonly cache?: ProviderCache;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

  constructor(options: LiveRiotProviderOptions) {
    this.apiKey = options.apiKey;
    this.cache = options.cache;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? 5;
    this.timeoutMs = options.timeoutMs ?? 12_000;
  }

  async getAccountMe(
    accessToken: string,
    accountRoute: "americas" | "europe" | "asia" = "americas",
  ): Promise<AccountIdentity> {
    const url = `${ACCOUNT_BASE_BY_ROUTE[accountRoute]}/riot/account/v1/accounts/me`;

    return this.request<AccountIdentity>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cacheKey: `account:me:${accountRoute}`,
      ttlSeconds: 60,
    });
  }

  async getMatchlist(region: ValorantRegion, puuid: string): Promise<MatchlistResponse> {
    const url = `${MATCH_BASE_BY_REGION[region]}/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`;

    return this.request<MatchlistResponse>(url, {
      cacheKey: `matchlist:${region}:${puuid}`,
      ttlSeconds: 180,
    });
  }

  async getMatch(region: ValorantRegion, matchId: string): Promise<RawMatchPayload> {
    const url = `${MATCH_BASE_BY_REGION[region]}/val/match/v1/matches/${encodeURIComponent(matchId)}`;

    return this.request<RawMatchPayload>(url, {
      cacheKey: `match:${region}:${matchId}`,
      ttlSeconds: 60 * 60 * 24 * 30,
    });
  }

  private async request<T>(
    url: string,
    options: {
      headers?: Record<string, string>;
      cacheKey?: string;
      ttlSeconds?: number;
    } = {},
  ): Promise<T> {
    if (this.cache && options.cacheKey) {
      const cached = await this.cache.get<T>(options.cacheKey);
      if (cached) {
        return cached;
      }
    }

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchImpl(url, {
          method: "GET",
          headers: {
            "X-Riot-Token": this.apiKey,
            "Content-Type": "application/json",
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          const json = (await response.json()) as T;
          if (this.cache && options.cacheKey && options.ttlSeconds) {
            await this.cache.set(options.cacheKey, json, options.ttlSeconds);
          }
          return json;
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(`Riot auth failure (${response.status}) for ${url}`);
        }

        if (response.status === 429 || response.status >= 500) {
          const retryAfterMs = retryAfterToMs(response.headers.get("retry-after"));
          await sleep(retryAfterMs ?? backoffWithJitter(attempt));
          attempt += 1;
          continue;
        }

        const responseText = await safeReadText(response);
        throw new Error(`Riot request failed (${response.status}) ${url}: ${responseText}`);
      } catch (error) {
        clearTimeout(timer);
        lastError = error;

        if (attempt >= this.maxRetries) {
          break;
        }

        await sleep(backoffWithJitter(attempt));
        attempt += 1;
      }
    }

    throw new Error(`Riot request exhausted retries for ${url}: ${String(lastError)}`);
  }
}

function retryAfterToMs(retryAfter: string | null): number | null {
  if (!retryAfter) {
    return null;
  }

  const asSeconds = Number(retryAfter);
  if (Number.isFinite(asSeconds) && asSeconds > 0) {
    return asSeconds * 1000;
  }

  const asDateMs = Date.parse(retryAfter);
  if (!Number.isNaN(asDateMs)) {
    return Math.max(0, asDateMs - Date.now());
  }

  return null;
}

function backoffWithJitter(attempt: number): number {
  const base = Math.min(30_000, 500 * Math.pow(2, attempt));
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<no body>";
  }
}
