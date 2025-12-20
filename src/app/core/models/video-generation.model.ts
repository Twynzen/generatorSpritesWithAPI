import { AspectRatio } from './cost.model';
import { VideoModelType } from './video-model.model';

// Request for submit to FAL.ai Luma Dream Machine
export interface FalSubmitRequest {
  imageUrl: string;
  prompt: string;
  aspectRatio: AspectRatio;
  loop: boolean;
}

// Request for submit to FAL.ai Kling VIDEO 2.6
export interface KlingSubmitRequest {
  imageUrl: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: number; // 5 or 10 seconds
  motionReferenceUrl?: string; // Optional motion reference video
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
  aspectRatio: AspectRatio;
  cost: number;
  videoUrl: string;
  thumbnailUrl?: string;
  spriteImageUrl: string;
  model?: VideoModelType; // Which model was used
  duration?: number; // Duration in seconds (for Kling)
}
