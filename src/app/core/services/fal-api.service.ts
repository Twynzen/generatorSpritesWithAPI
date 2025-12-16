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
   * Uses correct parameter names based on FAL.ai documentation
   */
  private buildRequestBody(request: FalSubmitRequest): Record<string, unknown> {
    const model = request.model;
    const modelId = model.id;

    // Models that DON'T require prompt (Stable Video Diffusion variants)
    if (!model.promptRequired) {
      return {
        image_url: request.imageUrl,
        motion_bucket_id: request.motionBucketId ?? 127,
        fps: request.fps ?? (modelId === 'fast-svd-lcm' ? 10 : 25),
        ...(modelId === 'fast-svd-lcm' && { steps: 4 })
      };
    }

    // Build model-specific request bodies
    switch (modelId) {
      // ═══════════════════════════════════════════════════════════════
      // LUMA MODELS - use end_image_url
      // ═══════════════════════════════════════════════════════════════
      case 'luma-dream-machine':
        // IMPORTANT: loop is NOT supported when using end_image_url
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          ...(request.endImageUrl && { end_image_url: request.endImageUrl }),
          aspect_ratio: request.aspectRatio ?? '16:9',
          ...(!request.endImageUrl && { loop: request.loop ?? false }) // Only include loop if NO end image
        };

      case 'luma-ray-2':
      case 'luma-ray-2-flash':
        // IMPORTANT: loop is NOT supported when using end_image_url
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          ...(request.endImageUrl && { end_image_url: request.endImageUrl }),
          aspect_ratio: request.aspectRatio ?? '16:9',
          resolution: request.resolution ?? '540p',
          duration: request.duration ?? '5s',
          ...(!request.endImageUrl && { loop: request.loop ?? false }) // Only include loop if NO end image
        };

      // ═══════════════════════════════════════════════════════════════
      // KLING v2.1 MODELS - None support end frame (use Kling O1 for that)
      // ═══════════════════════════════════════════════════════════════
      case 'kling-v2.1-pro':
      case 'kling-v2.1-master':
      case 'kling-v2.1-standard':
        // v2.1 models do NOT support tail_image_url - use Kling O1 for first/last frame
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          duration: request.duration ?? '5',
          aspect_ratio: request.aspectRatio ?? '16:9',
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality',
          cfg_scale: request.cfgScale ?? 0.5
        };

      // ═══════════════════════════════════════════════════════════════
      // KLING O1 - First-to-Last Frame video generation
      // ═══════════════════════════════════════════════════════════════
      case 'kling-o1':
        // Uses @Image1 and @Image2 references in prompt for start/end frames
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          ...(request.endImageUrl && { tail_image_url: request.endImageUrl }),
          duration: request.duration ?? '5',
          aspect_ratio: request.aspectRatio ?? '16:9',
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality',
          cfg_scale: request.cfgScale ?? 0.5
        };

      // ═══════════════════════════════════════════════════════════════
      // WAN MODELS
      // ═══════════════════════════════════════════════════════════════
      case 'wan-flf2v':
        // First-Last Frame model - requires BOTH images
        // Uses first_frame_url and last_frame_url (NOT start_image_url/end_image_url)
        return {
          prompt: request.prompt,
          first_frame_url: request.imageUrl,      // First frame
          last_frame_url: request.endImageUrl,    // Last frame (REQUIRED)
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality, static',
          resolution: request.resolution ?? '720p',
          aspect_ratio: request.aspectRatio ?? 'auto',
          num_frames: 81,
          frames_per_second: request.fps ?? 16,
          num_inference_steps: 30,
          guide_scale: 5
        };

      case 'wan-i2v':
        // Single image model
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          negative_prompt: request.negativePrompt ?? 'blur, distort, low quality',
          resolution: request.resolution ?? '480p',
          aspect_ratio: request.aspectRatio ?? 'auto',
          num_frames: 81,
          frames_per_second: request.fps ?? 16
        };

      // ═══════════════════════════════════════════════════════════════
      // MINIMAX - Camera control via prompt brackets
      // ═══════════════════════════════════════════════════════════════
      case 'minimax-video-01':
        return {
          prompt: request.prompt, // Include [Camera movement] in prompt
          image_url: request.imageUrl,
          prompt_optimizer: request.promptOptimizer ?? true
        };

      // ═══════════════════════════════════════════════════════════════
      // PIKA - duration is integer (not string!)
      // ═══════════════════════════════════════════════════════════════
      case 'pika-v2.2':
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          resolution: request.resolution ?? '720p',
          duration: 5, // Integer, not string
          ...(request.negativePrompt && { negative_prompt: request.negativePrompt })
        };

      // ═══════════════════════════════════════════════════════════════
      // LTX VIDEO (Research license only)
      // ═══════════════════════════════════════════════════════════════
      case 'ltx-video':
        return {
          prompt: request.prompt,
          image_url: request.imageUrl,
          ...(request.negativePrompt && { negative_prompt: request.negativePrompt }),
          num_inference_steps: 30,
          guidance_scale: 3
        };

      // Default fallback
      default:
        return {
          prompt: request.prompt,
          image_url: request.imageUrl
        };
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
   * Status: GET to status_url returned by submit
   * Returns HTTP 202 while processing, HTTP 200 when completed
   */
  getStatus(statusUrl: string): Observable<HttpResponse<FalStatusResponse>> {
    console.log(`[FalAPI] Polling status at: ${statusUrl}`);
    return this.http.get<FalStatusResponse>(statusUrl, { observe: 'response' });
  }

  /**
   * Result: GET to response_url returned by submit
   * Video is in response.video.url
   */
  getResult(responseUrl: string): Observable<FalResultResponse> {
    console.log(`[FalAPI] Fetching result from: ${responseUrl}`);
    return this.http.get<FalResultResponse>(responseUrl);
  }

  /**
   * Full flow: Submit → Poll Status → Get Result
   * Uses URLs returned by FAL.ai API (status_url, response_url)
   */
  generateWithPolling(request: FalSubmitRequest): Observable<VideoGenerationResult> {
    const model = request.model || DEFAULT_MODEL;

    return this.submitGeneration(request).pipe(
      switchMap(submitResponse => {
        const requestId = submitResponse.request_id;
        const statusUrl = submitResponse.status_url;
        const responseUrl = submitResponse.response_url;

        console.log(`[FalAPI] Job submitted to ${model.name}:`, {
          requestId,
          statusUrl,
          responseUrl
        });

        // Validate we got the required URLs
        if (!statusUrl || !responseUrl) {
          console.error('[FalAPI] Missing status_url or response_url in submit response');
          throw new Error('FAL.ai did not return polling URLs');
        }

        let pollCount = 0;

        // Poll every 5 seconds using the status_url from the response
        return interval(5000).pipe(
          switchMap(() => {
            pollCount++;
            console.log(`[FalAPI] Polling ${model.name} status (attempt ${pollCount})...`);
            return this.getStatus(statusUrl);
          }),
          // Continue while HTTP status is 202 (processing)
          // Stop when HTTP status is 200 (completed)
          takeWhile(response => {
            const isProcessing = response.status === 202;
            console.log(`[FalAPI] HTTP ${response.status}, body status: ${response.body?.status}`);
            return isProcessing;
          }, true), // inclusive: emit the 200 response too
          switchMap(response => {
            // If completed (HTTP 200), fetch the result from response_url
            if (response.status === 200) {
              console.log(`[FalAPI] ${model.name} completed! Fetching result...`);
              return this.getResult(responseUrl).pipe(
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
