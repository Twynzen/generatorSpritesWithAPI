import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, map, from, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  KlingSubmitRequest,
  FalSubmitResponse,
  VideoGenerationResult
} from '../models/video-generation.model';

// Status response from Kling
interface KlingStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queue_position?: number;
  logs?: { message: string; level: string; timestamp: string }[];
  metrics?: { inference_time?: number };
}

// Result response from Kling
interface KlingResultResponse {
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
export class KlingApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.falApi.baseUrl;

  // Kling VIDEO 2.6 Pro endpoint on FAL.ai
  private submitEndpoint = 'fal-ai/kling-video/v2.0/pro/image-to-video';
  private pollingBaseEndpoint = 'fal-ai/kling-video/v2.0/pro/image-to-video';

  /**
   * Converts a file to base64 data URI
   */
  uploadFile(file: File): Observable<string> {
    return from(new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }));
  }

  /**
   * Submit: POST to Kling endpoint
   */
  submitGeneration(request: KlingSubmitRequest): Observable<FalSubmitResponse> {
    const payload: Record<string, unknown> = {
      prompt: request.prompt,
      image_url: request.imageUrl,
      aspect_ratio: request.aspectRatio,
      duration: request.duration === 10 ? '10' : '5' // Kling uses string for duration
    };

    // Add motion reference if provided
    if (request.motionReferenceUrl) {
      payload['reference_video_url'] = request.motionReferenceUrl;
    }

    return this.http.post<FalSubmitResponse>(
      `${this.baseUrl}/${this.submitEndpoint}`,
      payload
    );
  }

  /**
   * Status: GET to /requests/{id}/status
   */
  getStatus(requestId: string): Observable<HttpResponse<KlingStatusResponse>> {
    return this.http.get<KlingStatusResponse>(
      `${this.baseUrl}/${this.pollingBaseEndpoint}/requests/${requestId}/status`,
      { observe: 'response' }
    );
  }

  /**
   * Result: GET to /requests/{id}
   */
  getResult(requestId: string): Observable<KlingResultResponse> {
    return this.http.get<KlingResultResponse>(
      `${this.baseUrl}/${this.pollingBaseEndpoint}/requests/${requestId}`
    );
  }

  /**
   * Full flow: Submit → Poll Status → Get Result
   */
  generateWithPolling(request: KlingSubmitRequest): Observable<VideoGenerationResult> {
    return this.submitGeneration(request).pipe(
      switchMap(submitResponse => {
        const requestId = submitResponse.request_id;
        console.log('Kling job submitted, request_id:', requestId);

        let pollCount = 0;

        // Poll every 5 seconds
        return interval(5000).pipe(
          switchMap(() => {
            pollCount++;
            console.log(`Kling polling status (attempt ${pollCount})...`);
            return this.getStatus(requestId);
          }),
          // Continue while HTTP status is 202 (processing)
          takeWhile(response => {
            const isProcessing = response.status === 202;
            console.log(`Kling HTTP ${response.status}, body status: ${response.body?.status}`);
            return isProcessing;
          }, true),
          switchMap(response => {
            if (response.status === 200) {
              console.log('Kling completed! Fetching result...');
              return this.getResult(requestId).pipe(
                map(result => {
                  console.log('Kling result:', result);
                  return {
                    status: 'completed' as const,
                    requestId,
                    video: result.video
                  };
                })
              );
            } else {
              const statusData = response.body!;
              return of({
                status: statusData.status === 'IN_QUEUE' ? 'in_queue' as const : 'in_progress' as const,
                requestId,
                progress: this.estimateProgress(pollCount, statusData)
              });
            }
          })
        );
      })
    );
  }

  /**
   * Estimates progress based on status and poll count
   */
  private estimateProgress(pollCount: number, status: KlingStatusResponse): number {
    if (status.status === 'IN_QUEUE') {
      return Math.min(5 + pollCount, 20);
    }
    if (status.status === 'IN_PROGRESS') {
      const logProgress = status.logs?.length || 0;
      return Math.min(20 + (pollCount * 5) + (logProgress * 2), 95);
    }
    return 95;
  }
}
