import { AspectRatio } from './cost.model';
import { VideoModelConfig } from '../constants/api.constants';

// ═══════════════════════════════════════════════════════════════
// MODEL-SPECIFIC PARAMETERS
// ═══════════════════════════════════════════════════════════════

// Base parameters shared by most models
export interface BaseVideoParams {
  imageUrl: string;
  prompt?: string;
  aspectRatio?: AspectRatio | string;
}

// Luma Dream Machine / Ray 2 parameters
export interface LumaParams extends BaseVideoParams {
  prompt: string;
  loop?: boolean;
  resolution?: '540p' | '720p' | '1080p';
  duration?: '5s' | '9s';
}

// Kling Video parameters (all versions)
export interface KlingParams extends BaseVideoParams {
  prompt: string;
  duration?: '5' | '10';
  negativePrompt?: string;
  cfgScale?: number; // 0-1, default 0.5
}

// MiniMax Video-01 parameters
export interface MiniMaxParams extends BaseVideoParams {
  prompt: string;
  promptOptimizer?: boolean;
}

// Wan 2.1 parameters
export interface WanParams extends BaseVideoParams {
  prompt: string;
  negativePrompt?: string;
  numFrames?: number; // 81-100
  framesPerSecond?: number; // 5-24
  resolution?: '480p' | '720p';
}

// Stable Video Diffusion parameters (NO PROMPT!)
export interface StableVideoParams {
  imageUrl: string;
  seed?: number;
  motionBucketId?: number; // 1-255, default 127 (higher = more motion)
  condAug?: number; // Default 0.02
  fps?: number; // Default 25
}

// Pika parameters
export interface PikaParams extends BaseVideoParams {
  prompt: string;
  resolution?: '720p' | '1080p';
}

// LTX Video parameters
export interface LTXParams extends BaseVideoParams {
  prompt: string;
  negativePrompt?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
}

// Union type for all model parameters
export type VideoModelParams =
  | LumaParams
  | KlingParams
  | MiniMaxParams
  | WanParams
  | StableVideoParams
  | PikaParams
  | LTXParams;

// ═══════════════════════════════════════════════════════════════
// UNIFIED SUBMIT REQUEST (used by FalApiService)
// ═══════════════════════════════════════════════════════════════

export interface FalSubmitRequest {
  imageUrl: string;
  prompt: string;
  aspectRatio: AspectRatio | string;
  loop: boolean;
  model: VideoModelConfig;
  // Model-specific options
  negativePrompt?: string;
  duration?: string;
  resolution?: string;
  motionBucketId?: number;
  fps?: number;
  cfgScale?: number;
  promptOptimizer?: boolean;
}

// Submit response
export interface FalSubmitResponse {
  request_id: string;
  response_url?: string;
  status_url?: string;
  cancel_url?: string;
}

// Log entry from FAL
export interface FalLogEntry {
  timestamp: string;
  message: string;
  labels?: Record<string, string>;
}

// Status response
// Note: FAILED status doesn't exist - errors come as HTTP 4xx/5xx
export interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLATION_REQUESTED';
  request_id?: string;
  queue_position?: number;
  logs?: FalLogEntry[];
  metrics?: {
    inference_time?: number;
  };
}

// Result response
export interface FalResultResponse {
  video: VideoResult;
  seed?: number;
}

// Video result
export interface VideoResult {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
}

// Generation state for UI
export interface VideoGenerationResult {
  status: 'in_queue' | 'in_progress' | 'completed';
  requestId: string;
  progress?: number;
  video?: VideoResult;
  logs?: FalLogEntry[];
}

// History item
export interface GenerationHistoryItem {
  id: string;
  createdAt: Date;
  prompt: string;
  aspectRatio: AspectRatio | string;
  cost: number;
  videoUrl: string;
  thumbnailUrl?: string;
  spriteImageUrl: string;
  modelId?: string;
  modelName?: string;
}
