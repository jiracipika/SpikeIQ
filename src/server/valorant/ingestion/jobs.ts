import { SupabaseClient } from "@supabase/supabase-js";
import { ValorantRegion } from "../provider/types";

export type ValorantJobType =
  | "sync_backfill_seed"
  | "sync_recent"
  | "fetch_matchlist"
  | "fetch_match"
  | "transform_match"
  | "recompute_metrics";

export interface SyncBackfillSeedPayload {
  userId: string;
  region: ValorantRegion;
  puuid: string;
}

export interface SyncRecentPayload {
  userId: string;
  region: ValorantRegion;
  puuid: string;
}

export interface FetchMatchlistPayload {
  userId: string;
  region: ValorantRegion;
  puuid: string;
  mode: "backfill" | "recent";
}

export interface FetchMatchPayload {
  userId: string;
  region: ValorantRegion;
  puuid: string;
  matchId: string;
}

export interface TransformMatchPayload {
  userId: string;
  region: ValorantRegion;
  puuid: string;
  matchId: string;
}

export interface RecomputeMetricsPayload {
  userId: string;
  matchId: string;
}

export type ValorantJobPayload =
  | SyncBackfillSeedPayload
  | SyncRecentPayload
  | FetchMatchlistPayload
  | FetchMatchPayload
  | TransformMatchPayload
  | RecomputeMetricsPayload;

export interface ValorantIngestionJob {
  id: number;
  job_type: ValorantJobType;
  dedupe_key: string | null;
  payload: ValorantJobPayload;
  status: "queued" | "running" | "completed" | "failed" | "dead_letter";
  priority: number;
  attempts: number;
  max_attempts: number;
  run_after: string;
  locked_by: string | null;
  locked_at: string | null;
  completed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export class ValorantJobQueue {
  constructor(private readonly supabase: SupabaseClient) {}

  enqueue(
    jobType: ValorantJobType,
    payload: Record<string, unknown>,
    options: {
      dedupeKey?: string;
      runAfter?: Date;
      priority?: number;
      maxAttempts?: number;
    } = {},
  ): Promise<number> {
    return enqueueJob(this.supabase, {
      jobType,
      payload,
      dedupeKey: options.dedupeKey,
      runAfter: options.runAfter,
      priority: options.priority,
      maxAttempts: options.maxAttempts,
    });
  }
}

export async function enqueueJob(
  supabase: SupabaseClient,
  params: {
    jobType: ValorantJobType;
    payload: Record<string, unknown>;
    dedupeKey?: string;
    runAfter?: Date;
    priority?: number;
    maxAttempts?: number;
  },
): Promise<number> {
  const { data, error } = await supabase.rpc("enqueue_valorant_job", {
    p_job_type: params.jobType,
    p_payload: params.payload,
    p_dedupe_key: params.dedupeKey ?? null,
    p_run_after: (params.runAfter ?? new Date()).toISOString(),
    p_priority: params.priority ?? 100,
    p_max_attempts: params.maxAttempts ?? 8,
  });

  if (error) {
    throw new Error(`Failed to enqueue ${params.jobType}: ${error.message}`);
  }

  const jobId = Number(data);
  if (!Number.isFinite(jobId)) {
    throw new Error(`enqueue_valorant_job returned invalid id for ${params.jobType}`);
  }

  return jobId;
}

export async function claimJobs(
  supabase: SupabaseClient,
  workerId: string,
  limit = 10,
): Promise<ValorantIngestionJob[]> {
  const { data, error } = await supabase.rpc("claim_valorant_jobs", {
    p_worker_id: workerId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Failed to claim jobs: ${error.message}`);
  }

  return (data ?? []) as ValorantIngestionJob[];
}

export async function completeJob(
  supabase: SupabaseClient,
  params: {
    jobId: number;
    success: boolean;
    error?: string;
    retryDelaySeconds?: number;
  },
): Promise<void> {
  const { error } = await supabase.rpc("complete_valorant_job", {
    p_job_id: params.jobId,
    p_success: params.success,
    p_error: params.error ?? null,
    p_retry_delay_seconds: params.retryDelaySeconds ?? 60,
  });

  if (error) {
    throw new Error(`Failed to complete job ${params.jobId}: ${error.message}`);
  }
}

export function computeRetryDelaySeconds(attempts: number): number {
  const base = Math.min(300, 5 * Math.pow(2, attempts));
  const jitter = Math.floor(Math.random() * 4);
  return base + jitter;
}
