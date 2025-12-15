import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FalSubmitRequest,
  FalSubmitResponse,
  FalStatusResponse,
  FalResultResponse,
  VideoGenerationResult
} from '../models/video-generation.model';

@Injectable({
  providedIn: 'root'
})
export class FalApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.falApi.baseUrl;
  private modelEndpoint = 'fal-ai/wan-flf2v';

  /**
   * Uploads an image to FAL.ai storage and returns the URL
   * Required because FAL requires public URLs, not base64
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(
      `https://fal.run/fal-ai/upload`,
      formData
    ).pipe(
      map(response => response.url)
    );
  }

  /**
   * Submits a video generation job
   */
  submitGeneration(request: FalSubmitRequest): Observable<FalSubmitResponse> {
    return this.http.post<FalSubmitResponse>(
      `${this.baseUrl}/${this.modelEndpoint}`,
      {
        input: {
          first_frame_url: request.firstFrameUrl,
          last_frame_url: request.lastFrameUrl,
          prompt: request.prompt,
          resolution: request.resolution,
          negative_prompt: request.negativePrompt || 'ugly, blurry, distorted, bad quality'
        }
      }
    );
  }

  /**
   * Gets the status of a job
   */
  getStatus(requestId: string): Observable<FalStatusResponse> {
    return this.http.get<FalStatusResponse>(
      `${this.baseUrl}/${this.modelEndpoint}/status/${requestId}`
    );
  }

  /**
   * Gets the result of a completed job
   */
  getResult(requestId: string): Observable<FalResultResponse> {
    return this.http.get<FalResultResponse>(
      `${this.baseUrl}/${this.modelEndpoint}/result/${requestId}`
    );
  }

  /**
   * Automatic polling until video is ready
   * Returns Observable that emits progress and finally the result
   */
  generateWithPolling(request: FalSubmitRequest): Observable<VideoGenerationResult> {
    return this.submitGeneration(request).pipe(
      switchMap(submitResponse => {
        const requestId = submitResponse.request_id;

        // Poll every 3 seconds
        return interval(3000).pipe(
          switchMap(() => this.getStatus(requestId)),
          takeWhile(status => status.status !== 'COMPLETED' && status.status !== 'FAILED', true),
          switchMap(status => {
            if (status.status === 'COMPLETED') {
              return this.getResult(requestId).pipe(
                map(result => ({
                  status: 'completed' as const,
                  requestId,
                  video: result.video,
                  logs: status.logs
                }))
              );
            } else if (status.status === 'FAILED') {
              throw new Error(status.error || 'Video generation failed');
            } else {
              // IN_QUEUE or IN_PROGRESS
              return of({
                status: status.status.toLowerCase() as 'in_queue' | 'in_progress',
                requestId,
                progress: this.estimateProgress(status),
                logs: status.logs
              });
            }
          })
        );
      })
    );
  }

  /**
   * Estimates progress based on logs and time
   */
  private estimateProgress(status: FalStatusResponse): number {
    if (status.status === 'IN_QUEUE') return 5;
    if (status.status === 'IN_PROGRESS') {
      // Based on logs, estimate progress
      const logCount = status.logs?.length || 0;
      return Math.min(10 + (logCount * 10), 90);
    }
    return 0;
  }
}
