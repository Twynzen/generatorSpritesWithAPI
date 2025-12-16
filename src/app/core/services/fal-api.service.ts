import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, map, from, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FalSubmitRequest,
  FalSubmitResponse,
  VideoGenerationResult
} from '../models/video-generation.model';
import { VideoModelConfig, DEFAULT_MODEL } from '../constants/api.constants';

// Status response from /requests/{id}/status
interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queue_position?: number;
  logs?: { message: string; level: string; timestamp: string }[];
  metrics?: { inference_time?: number };
}

// Result response from /requests/{id}
interface FalResultResponse {
  video: {
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FalApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.falApi.baseUrl;

  /**
   * Converts a file to base64 data URI
   */
  uploadImage(file: File): Observable<string> {
    return from(new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }));
  }

  /**
   * Builds the request body based on the model type
   */
  private buildRequestBody(request: FalSubmitRequest): Record<string, unknown> {
    const model = request.model;
    const modelId = model.id;

    // Base payload with image
    const payload: Record<string, unknown> = {
      image_url: request.imageUrl
    };

    // Models that DON'T require prompt (Stable Video Diffusion variants)
    if (!model.promptRequired) {
      return {
        ...payload,
        motion_bucket_id: request.motionBucketId ?? 127,
        fps: request.fps ?? 25
      };
    }

    // All other models require prompt
    payload['prompt'] = request.prompt;

    // Build model-specific parameters
    switch (modelId) {
      // Kling models
      case 'kling-v2.1-master':
      case 'kling-v2.1-pro':
      case 'kling-v2.1-standard':
        return {
          ...payload,
          duration: request.duration ?? '5',
          aspect_ratio: request.aspectRatio ?? '16:9',
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality',
          cfg_scale: request.cfgScale ?? 0.5
        };

      // Luma Dream Machine v1.5
      case 'luma-dream-machine':
        return {
          ...payload,
          aspect_ratio: request.aspectRatio ?? '16:9',
          loop: request.loop ?? false
        };

      // Luma Ray 2 variants
      case 'luma-ray-2':
      case 'luma-ray-2-flash':
        return {
          ...payload,
          aspect_ratio: request.aspectRatio ?? '16:9',
          resolution: request.resolution ?? '540p',
          duration: request.duration ?? '5s',
          loop: request.loop ?? false
        };

      // MiniMax Video-01
      case 'minimax-video-01':
        return {
          ...payload,
          prompt_optimizer: request.promptOptimizer ?? true
        };

      // Wan 2.1 First-Last Frame (requires TWO images)
      case 'wan-flf2v':
        return {
          start_image_url: request.imageUrl,
          end_image_url: request.endImageUrl,
          prompt: request.prompt,
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality, static',
          resolution: request.resolution ?? '720p',
          aspect_ratio: request.aspectRatio ?? 'auto',
          num_frames: 81,
          frames_per_second: request.fps ?? 16
        };

      // Wan 2.1 Image-to-Video (single image)
      case 'wan-i2v':
        return {
          ...payload,
          resolution: request.resolution ?? '480p',
          aspect_ratio: request.aspectRatio ?? 'auto',
          num_frames: 81,
          frames_per_second: request.fps ?? 16
        };

      // Pika v2.2
      case 'pika-v2.2':
        return {
          ...payload,
          resolution: request.resolution ?? '720p'
        };

      // LTX Video
      case 'ltx-video':
        return {
          ...payload,
          negative_prompt: request.negativePrompt
        };

      // Default fallback (generic model)
      default:
        return payload;
    }
  }

  /**
   * Submit: POST to /{model-endpoint}
   */
  submitGeneration(request: FalSubmitRequest): Observable<FalSubmitResponse> {
    const model = request.model || DEFAULT_MODEL;
    const body = this.buildRequestBody(request);

    console.log(`[FalAPI] Submitting to ${model.endpoint}`, body);

    return this.http.post<FalSubmitResponse>(
      `${this.baseUrl}/${model.endpoint}`,
      body
    );
  }

  /**
   * Status: GET to /{model-polling-endpoint}/requests/{id}/status
   * Returns HTTP 202 while processing, HTTP 200 when completed
   */
  getStatus(requestId: string, model: VideoModelConfig): Observable<HttpResponse<FalStatusResponse>> {
    return this.http.get<FalStatusResponse>(
      `${this.baseUrl}/${model.pollingEndpoint}/requests/${requestId}/status`,
      { observe: 'response' }
    );
  }

  /**
   * Result: GET to /{model-polling-endpoint}/requests/{id}
   * Video is in response.video.url
   */
  getResult(requestId: string, model: VideoModelConfig): Observable<FalResultResponse> {
    return this.http.get<FalResultResponse>(
      `${this.baseUrl}/${model.pollingEndpoint}/requests/${requestId}`
    );
  }

  /**
   * Full flow: Submit → Poll Status → Get Result
   */
  generateWithPolling(request: FalSubmitRequest): Observable<VideoGenerationResult> {
    const model = request.model || DEFAULT_MODEL;

    return this.submitGeneration(request).pipe(
      switchMap(submitResponse => {
        const requestId = submitResponse.request_id;
        console.log(`[FalAPI] Job submitted to ${model.name}, request_id:`, requestId);

        let pollCount = 0;

        // Poll every 5 seconds
        return interval(5000).pipe(
          switchMap(() => {
            pollCount++;
            console.log(`[FalAPI] Polling ${model.name} status (attempt ${pollCount})...`);
            return this.getStatus(requestId, model);
          }),
          // Continue while HTTP status is 202 (processing)
          // Stop when HTTP status is 200 (completed)
          takeWhile(response => {
            const isProcessing = response.status === 202;
            console.log(`[FalAPI] HTTP ${response.status}, body status: ${response.body?.status}`);
            return isProcessing;
          }, true), // inclusive: emit the 200 response too
          switchMap(response => {
            // If completed (HTTP 200), fetch the result from separate endpoint
            if (response.status === 200) {
              console.log(`[FalAPI] ${model.name} completed! Fetching result...`);
              return this.getResult(requestId, model).pipe(
                map(result => {
                  console.log('[FalAPI] Result:', result);
                  return {
                    status: 'completed' as const,
                    requestId,
                    video: result.video
                  };
                })
              );
            } else {
              // Still processing (HTTP 202)
              const statusData = response.body!;
              return of({
                status: statusData.status === 'IN_QUEUE' ? 'in_queue' as const : 'in_progress' as const,
                requestId,
                progress: this.estimateProgress(pollCount, statusData, model)
              });
            }
          })
        );
      })
    );
  }

  /**
   * Estimates progress based on status, poll count, and model speed
   */
  private estimateProgress(pollCount: number, status: FalStatusResponse, model: VideoModelConfig): number {
    // Adjust progress rate based on model tier (economy = faster, premium = slower)
    const speedMultiplier = model.tier === 'economy' ? 3 : model.tier === 'balanced' ? 2 : 1;

    if (status.status === 'IN_QUEUE') {
      return Math.min(5 + (pollCount * speedMultiplier), 20);
    }
    if (status.status === 'IN_PROGRESS') {
      const logProgress = status.logs?.length || 0;
      return Math.min(20 + (pollCount * 3 * speedMultiplier) + (logProgress * 2), 95);
    }
    return 95;
  }
}
