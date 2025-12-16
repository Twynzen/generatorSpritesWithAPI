import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
import { ImageMetadata } from '../../core/models/image-metadata.model';
import { AspectRatio } from '../../core/models/cost.model';

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
    return this.costService.calculateCost(this.state.aspectRatio());
  }

  /**
   * Handles when sprite image is selected
   */
  onSpriteImageSelected(event: { file: File; metadata: ImageMetadata }): void {
    this.clearError();
    this.state.setSpriteImage({
      file: event.file,
      metadata: event.metadata
    });
  }

  /**
   * Removes the sprite image
   */
  removeSpriteImage(): void {
    this.state.setSpriteImage(null);
    if (this.state.result()) {
      this.state.resetGeneration();
    }
  }

  /**
   * Handles prompt change
   */
  onPromptChange(prompt: string): void {
    this.state.setPrompt(prompt);
  }

  /**
   * Handles aspect ratio change
   */
  onAspectRatioChange(aspectRatio: AspectRatio): void {
    this.state.setAspectRatio(aspectRatio);
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

    const spriteImage = this.state.spriteImage()!;

    this.state.setStatus('uploading');
    this.state.setProgress(10);
    this.state.setLogs([]);

    try {
      // 1. Upload image to FAL storage (as base64)
      this.state.addLog('Uploading sprite image...');

      this.falApi.uploadImage(spriteImage.file).subscribe({
        next: (imageUrl) => {
          this.state.setProgress(30);
          this.state.addLog('Image uploaded successfully');

          // 2. Start generation with Luma Dream Machine
          this.state.setStatus('in_queue');
          this.state.addLog('Sending generation request to Luma Dream Machine...');

          this.falApi.generateWithPolling({
            imageUrl: imageUrl,
            prompt: this.state.prompt(),
            aspectRatio: this.state.aspectRatio(),
            loop: true // Always enable loop for sprite animations
          }).subscribe({
            next: (result) => {
              console.log('Generation result:', result); // DEBUG
              if (result.status === 'in_queue') {
                this.state.setStatus('in_queue');
                this.state.setProgress(40);
              } else if (result.status === 'in_progress') {
                this.state.setStatus('in_progress');
                this.state.setProgress(result.progress || 50);
              } else if (result.status === 'completed') {
                console.log('Video completed:', result.video); // DEBUG
                this.state.setProgress(100);
                if (result.video) {
                  this.state.setResult(result.video);
                  this.state.addLog('Video generated successfully!');
                  // Save to history
                  this.storageService.addToHistory({
                    prompt: this.state.prompt(),
                    aspectRatio: this.state.aspectRatio(),
                    cost: this.costEstimate.pricePerVideo,
                    videoUrl: result.video.url,
                    spriteImageUrl: imageUrl
                  });
                } else {
                  this.state.addLog('Completed but no video in response');
                  console.error('No video in result:', result);
                }
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
