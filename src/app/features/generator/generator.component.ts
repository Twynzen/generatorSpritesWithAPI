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
import { ModelSelectorComponent } from '../../shared/components/model-selector/model-selector.component';

// Models
import { ImageMetadata } from '../../core/models/image-metadata.model';
import { AspectRatio } from '../../core/models/cost.model';
import { VideoModelConfig } from '../../core/constants/api.constants';

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
    ProgressIndicatorComponent,
    ModelSelectorComponent
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

  // Computed cost (now using selected model)
  get costEstimate() {
    return this.costService.calculateCostForModel(
      this.state.aspectRatio(),
      this.state.selectedModel()
    );
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
   * Handles when end image is selected (for models that support it)
   */
  onEndImageSelected(event: { file: File; metadata: ImageMetadata }): void {
    this.clearError();
    this.state.setEndImage({
      file: event.file,
      metadata: event.metadata
    });
  }

  /**
   * Removes the end image
   */
  removeEndImage(): void {
    this.state.setEndImage(null);
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
   * Handles model selection change
   */
  onModelChange(model: VideoModelConfig): void {
    this.state.setSelectedModel(model);
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
    const endImage = this.state.endImage();
    const selectedModel = this.state.selectedModel();
    const needsEndImage = selectedModel.supportsEndImage;

    this.state.setStatus('uploading');
    this.state.setProgress(10);
    this.state.setLogs([]);

    try {
      // 1. Upload start image
      this.state.addLog(needsEndImage ? 'Uploading start frame...' : 'Uploading sprite image...');

      this.falApi.uploadImage(spriteImage.file).subscribe({
        next: (startImageUrl) => {
          this.state.setProgress(needsEndImage ? 20 : 30);
          this.state.addLog(needsEndImage ? 'Start frame uploaded' : 'Image uploaded successfully');

          // 2. If model needs end image, upload it too
          if (needsEndImage && endImage) {
            this.state.addLog('Uploading end frame...');

            this.falApi.uploadImage(endImage.file).subscribe({
              next: (endImageUrl) => {
                this.state.setProgress(30);
                this.state.addLog('End frame uploaded');

                // 3. Start generation with both images
                this.startGeneration(selectedModel, startImageUrl, endImageUrl);
              },
              error: (error) => {
                this.state.setError(error.message || 'End image upload error');
                this.state.addLog(`Error uploading end frame: ${error.message}`);
              }
            });
          } else {
            // Single image model - start generation
            this.startGeneration(selectedModel, startImageUrl, undefined);
          }
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
   * Starts the actual generation after images are uploaded
   */
  private startGeneration(selectedModel: VideoModelConfig, startImageUrl: string, endImageUrl?: string): void {
    this.state.setStatus('in_queue');
    this.state.addLog(`Sending generation request to ${selectedModel.name}...`);

    this.falApi.generateWithPolling({
      imageUrl: startImageUrl,
      endImageUrl: endImageUrl, // Pass end image URL if available
      prompt: this.state.prompt(),
      aspectRatio: this.state.aspectRatio(),
      loop: selectedModel.supportsLoop,
      model: selectedModel
    }).subscribe({
      next: (result) => {
        console.log('Generation result:', result);
        if (result.status === 'in_queue') {
          this.state.setStatus('in_queue');
          this.state.setProgress(40);
        } else if (result.status === 'in_progress') {
          this.state.setStatus('in_progress');
          this.state.setProgress(result.progress || 50);
        } else if (result.status === 'completed') {
          console.log('Video completed:', result.video);
          this.state.setProgress(100);
          if (result.video) {
            this.state.setResult(result.video);
            this.state.addLog('Video generated successfully!');
            // Save to history with model info
            this.storageService.addToHistory({
              prompt: this.state.prompt(),
              aspectRatio: this.state.aspectRatio(),
              cost: this.costEstimate.pricePerVideo,
              videoUrl: result.video.url,
              spriteImageUrl: startImageUrl,
              modelId: selectedModel.id,
              modelName: selectedModel.name
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
  }

  /**
   * Starts new generation
   */
  startNewGeneration(): void {
    this.state.resetGeneration();
  }

  /**
   * Retry the same generation after an error
   */
  retryGeneration(): void {
    this.clearError();
    this.state.resetGeneration();
    // Small delay to let state update, then retry
    setTimeout(() => this.generateVideo(), 100);
  }

  /**
   * Reset to try a different model (keeps images, clears error)
   */
  resetForNewModel(): void {
    this.clearError();
    this.state.resetGeneration();
    // Scroll to model selector
    const modelSection = document.querySelector('.input-group:nth-of-type(2)');
    modelSection?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Full reset
   */
  resetAll(): void {
    this.state.reset();
    this.clearError();
  }
}
