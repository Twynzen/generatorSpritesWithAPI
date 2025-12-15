import { Resolution } from './cost.model';

// Request for submit to FAL.ai
export interface FalSubmitRequest {
  firstFrameUrl: string;
  lastFrameUrl: string;
  prompt: string;
  resolution: Resolution;
  negativePrompt?: string;
}

// Submit response
export interface FalSubmitResponse {
  request_id: string;
  status: string;
}

// Status response
export interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  logs?: string[];
  error?: string;
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
  status: 'in_queue' | 'in_progress' | 'completed' | 'failed';
  requestId: string;
  progress?: number;
  video?: VideoResult;
  logs?: string[];
  error?: string;
}

// History item
export interface GenerationHistoryItem {
  id: string;
  createdAt: Date;
  prompt: string;
  resolution: Resolution;
  cost: number;
  videoUrl: string;
  thumbnailUrl?: string;
  firstFrameUrl: string;
  lastFrameUrl: string;
}
