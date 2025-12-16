import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, map, from, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FalSubmitRequest,
  FalSubmitResponse,
  VideoGenerationResult
} from '../models/video-generation.model';

// Status response from /requests/{id}/status
interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queue_position?: number;
  logs?: { message: string; level: string; timestamp: string }[];
  metrics?: { inference_time?: number };
}

// Result response from /requests/{id} (separate endpoint)
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

  // IMPORTANT: Submit path includes /image-to-video, but polling paths DON'T
  private submitEndpoint = 'fal-ai/luma-dream-machine/image-to-video';
  private pollingBaseEndpoint = 'fal-ai/luma-dream-machine'; // NO /image-to-video!

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
   * Submit: POST to /fal-ai/luma-dream-machine/image-to-video
   */
  submitGeneration(request: FalSubmitRequest): Observable<FalSubmitResponse> {
    return this.http.post<FalSubmitResponse>(
      `${this.baseUrl}/${this.submitEndpoint}`,
      {
        prompt: request.prompt,
        image_url: request.imageUrl,
        aspect_ratio: request.aspectRatio,
        loop: request.loop
      }
    );
  }

  /**
   * Status: GET to /fal-ai/luma-dream-machine/requests/{id}/status
   * Returns HTTP 202 while processing, HTTP 200 when completed
   */
  getStatus(requestId: string): Observable<HttpResponse<FalStatusResponse>> {
    return this.http.get<FalStatusResponse>(
      `${this.baseUrl}/${this.pollingBaseEndpoint}/requests/${requestId}/status`,
      { observe: 'response' }
    );
  }

  /**
   * Result: GET to /fal-ai/luma-dream-machine/requests/{id}
   * Video is in response.video.url
   */
  getResult(requestId: string): Observable<FalResultResponse> {
    return this.http.get<FalResultResponse>(
      `${this.baseUrl}/${this.pollingBaseEndpoint}/requests/${requestId}`
    );
  }

  /**
   * Full flow: Submit → Poll Status → Get Result
   */
  generateWithPolling(request: FalSubmitRequest): Observable<VideoGenerationResult> {
    return this.submitGeneration(request).pipe(
      switchMap(submitResponse => {
        const requestId = submitResponse.request_id;
        console.log('Job submitted, request_id:', requestId);

        let pollCount = 0;

        // Poll every 5 seconds
        return interval(5000).pipe(
          switchMap(() => {
            pollCount++;
            console.log(`Polling status (attempt ${pollCount})...`);
            return this.getStatus(requestId);
          }),
          // Continue while HTTP status is 202 (processing)
          // Stop when HTTP status is 200 (completed)
          takeWhile(response => {
            const isProcessing = response.status === 202;
            console.log(`HTTP ${response.status}, body status: ${response.body?.status}`);
            return isProcessing;
          }, true), // inclusive: emit the 200 response too
          switchMap(response => {
            // If completed (HTTP 200), fetch the result from separate endpoint
            if (response.status === 200) {
              console.log('Completed! Fetching result...');
              return this.getResult(requestId).pipe(
                map(result => {
                  console.log('Result:', result);
                  return {
                    status: 'completed' as const,
                    requestId,
                    video: result.video // Video is directly in result.video
                  };
                })
              );
            } else {
              // Still processing (HTTP 202)
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
  private estimateProgress(pollCount: number, status: FalStatusResponse): number {
    if (status.status === 'IN_QUEUE') {
      return Math.min(5 + pollCount, 20);
    }
    if (status.status === 'IN_PROGRESS') {
      // Use logs count or poll count to estimate
      const logProgress = status.logs?.length || 0;
      return Math.min(20 + (pollCount * 5) + (logProgress * 2), 95);
    }
    return 95;
  }
}
