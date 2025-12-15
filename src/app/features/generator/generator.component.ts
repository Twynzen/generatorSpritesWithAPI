import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, switchMap, of } from 'rxjs';

// Services
import { FalApiService } from '../../core/services/fal-api.service';
import { CostService } from '../../core/services/cost.service';
import { StorageService } from '../../core/services/storage.service';

// State
import { VideoGeneratorState } from '../../state/video-generator.state';

// Components
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ImagePreviewComponent } from '../../shared/components/image-preview/image-preview.component';
import { PromptEditorComponent } from '../../shared/components/prompt-editor/prompt-editor.component';
import { CostDisplayComponent } from '../../shared/components/cost-display/cost-display.component';
import { VideoResultComponent } from '../../shared/components/video-result/video-result.component';
import { ProgressIndicatorComponent } from '../../shared/components/progress-indicator/progress-indicator.component';

// Models
import { ImageMetadata, ProcessedImage } from '../../core/models/image-metadata.model';
import { Resolution } from '../../core/models/cost.model';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DropZoneComponent,
    ImagePreviewComponent,
    PromptEditorComponent,
    CostDisplayComponent,
    VideoResultComponent,
    ProgressIndicatorComponent
  ],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent {
  // Services
  private falApi = inject(FalApiService);
  private costService = inject(CostService);
  storageService = inject(StorageService);

  // State
  state = inject(VideoGeneratorState);

  // Local state
  errorMessage: string | null = null;

  // Computed cost
  get costEstimate() {
    return this.costService.calculateCost(this.state.resolution());
  }

  /**
   * Handles when first frame is selected
   */
  onFirstFrameSelected(event: { file: File; metadata: ImageMetadata }): void {
    this.clearError();
    this.state.setFirstFrame({
      file: event.file,
      metadata: event.metadata
    });
  }

  /**
   * Handles when last frame is selected
   */
  onLastFrameSelected(event: { file: File; metadata: ImageMetadata }): void {
    this.clearError();
    this.state.setLastFrame({
      file: event.file,
      metadata: event.metadata
    });
  }

  /**
   * Removes the first frame
   */
  removeFirstFrame(): void {
    this.state.setFirstFrame(null);
    if (this.state.result()) {
      this.state.resetGeneration();
    }
  }

  /**
   * Removes the last frame
   */
  removeLastFrame(): void {
    this.state.setLastFrame(null);
  }

  /**
   * Toggle use same frame
   */
  onUseSameFrameChange(value: boolean): void {
    this.state.setUseSameFrame(value);
    if (value) {
      this.state.setLastFrame(null);
    }
  }

  /**
   * Handles prompt change
   */
  onPromptChange(prompt: string): void {
    this.state.setPrompt(prompt);
  }

  /**
   * Handles resolution change
   */
  onResolutionChange(resolution: Resolution): void {
    this.state.setResolution(resolution);
  }

  /**
   * Handles errors from child components
   */
  onError(message: string): void {
    this.errorMessage = message;
  }

  /**
   * Clears error message
   */
  clearError(): void {
    this.errorMessage = null;
    this.state.setError(null);
  }

  /**
   * Starts video generation
   */
  async generateVideo(): Promise<void> {
    if (!this.state.canGenerate()) return;

    const firstFrame = this.state.firstFrame()!;
    const lastFrame = this.state.effectiveLastFrame()!;

    this.state.setStatus('uploading');
    this.state.setProgress(10);
    this.state.setLogs([]);

    try {
      // 1. Upload images to FAL storage
      this.state.addLog('Uploading images...');

      const uploads$ = this.state.useSameFrame()
        ? this.falApi.uploadImage(firstFrame.file).pipe(
            switchMap(url => of({ firstUrl: url, lastUrl: url }))
          )
        : forkJoin({
            firstUrl: this.falApi.uploadImage(firstFrame.file),
            lastUrl: this.falApi.uploadImage(lastFrame.file)
          });

      uploads$.subscribe({
        next: (uploadedUrls) => {
          this.state.setProgress(30);
          this.state.addLog('Images uploaded successfully');

          // 2. Start generation
          this.state.setStatus('in_queue');
          this.state.addLog('Sending generation request...');

          this.falApi.generateWithPolling({
            firstFrameUrl: uploadedUrls.firstUrl,
            lastFrameUrl: uploadedUrls.lastUrl,
            prompt: this.state.prompt(),
            resolution: this.state.resolution()
          }).subscribe({
            next: (result) => {
              if (result.status === 'in_queue') {
                this.state.setStatus('in_queue');
                this.state.setProgress(40);
              } else if (result.status === 'in_progress') {
                this.state.setStatus('in_progress');
                this.state.setProgress(result.progress || 50);
                if (result.logs) {
                  result.logs.forEach(log => this.state.addLog(log));
                }
              } else if (result.status === 'completed' && result.video) {
                this.state.setProgress(100);
                this.state.setResult(result.video);
                this.state.addLog('Video generated successfully!');

                // Save to history
                this.storageService.addToHistory({
                  prompt: this.state.prompt(),
                  resolution: this.state.resolution(),
                  cost: this.costEstimate.pricePerVideo,
                  videoUrl: result.video.url,
                  firstFrameUrl: uploadedUrls.firstUrl,
                  lastFrameUrl: uploadedUrls.lastUrl
                });
              }
            },
            error: (error) => {
              this.state.setError(error.message || 'Generation error');
              this.state.addLog(`Error: ${error.message}`);
            }
          });
        },
        error: (error) => {
          this.state.setError(error.message || 'Upload error');
          this.state.addLog(`Error: ${error.message}`);
        }
      });

    } catch (error: any) {
      this.state.setError(error.message || 'Unknown error');
      this.state.addLog(`Error: ${error.message}`);
    }
  }

  /**
   * Starts new generation
   */
  startNewGeneration(): void {
    this.state.resetGeneration();
  }

  /**
   * Full reset
   */
  resetAll(): void {
    this.state.reset();
    this.clearError();
  }
}
