import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Services
import { FalApiService } from '../../core/services/fal-api.service';
import { KlingApiService } from '../../core/services/kling-api.service';
import { CostService } from '../../core/services/cost.service';
import { StorageService } from '../../core/services/storage.service';

// State
import { VideoGeneratorState, MotionReference } from '../../state/video-generator.state';

// Components
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ImagePreviewComponent } from '../../shared/components/image-preview/image-preview.component';
import { PromptEditorComponent } from '../../shared/components/prompt-editor/prompt-editor.component';
import { CostDisplayComponent } from '../../shared/components/cost-display/cost-display.component';
import { VideoResultComponent } from '../../shared/components/video-result/video-result.component';
import { ProgressIndicatorComponent } from '../../shared/components/progress-indicator/progress-indicator.component';
import { ModelSelectorComponent } from '../../shared/components/model-selector/model-selector.component';
import { MotionReferenceComponent, MotionReferenceFile } from '../../shared/components/motion-reference/motion-reference.component';

// Models
import { ImageMetadata } from '../../core/models/image-metadata.model';
import { AspectRatio } from '../../core/models/cost.model';
import { VideoModelType, VIDEO_MODELS } from '../../core/models/video-model.model';

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
    ModelSelectorComponent,
    MotionReferenceComponent
  ],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent {
  // Services
  private falApi = inject(FalApiService);
  private klingApi = inject(KlingApiService);
  private costService = inject(CostService);
  storageService = inject(StorageService);

  // State
  state = inject(VideoGeneratorState);

  // Local state
  errorMessage: string | null = null;

  // Model info for template
  readonly VIDEO_MODELS = VIDEO_MODELS;

  // Computed cost (now includes model and duration)
  get costEstimate() {
    return this.costService.calculateCost(
      this.state.aspectRatio(),
      this.state.selectedModel(),
      this.state.duration()
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
   * Handles model change
   */
  onModelChange(model: VideoModelType): void {
    this.state.setSelectedModel(model);
    // Reset aspect ratio to a compatible one if needed
    const modelInfo = VIDEO_MODELS[model];
    if (!modelInfo.supportedAspectRatios.includes(this.state.aspectRatio())) {
      this.state.setAspectRatio(modelInfo.supportedAspectRatios[0] as AspectRatio);
    }
  }

  /**
   * Handles duration change (for Kling)
   */
  onDurationChange(duration: number): void {
    this.state.setDuration(duration);
  }

  /**
   * Handles motion reference selection (for Kling)
   */
  onMotionReferenceSelected(ref: MotionReferenceFile): void {
    this.state.setMotionReference({
      file: ref.file,
      url: ref.url
    });
  }

  /**
   * Removes motion reference
   */
  removeMotionReference(): void {
    this.state.setMotionReference(null);
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
   * Starts video generation based on selected model
   */
  async generateVideo(): Promise<void> {
    if (!this.state.canGenerate()) return;

    const selectedModel = this.state.selectedModel();

    if (selectedModel === 'luma-dream-machine') {
      await this.generateWithLuma();
    } else if (selectedModel === 'kling-v2.6') {
      await this.generateWithKling();
    }
  }

  /**
   * Generate with Luma Dream Machine
   */
  private async generateWithLuma(): Promise<void> {
    const spriteImage = this.state.spriteImage()!;

    this.state.setStatus('uploading');
    this.state.setProgress(10);
    this.state.setLogs([]);

    try {
      this.state.addLog('Uploading sprite image...');

      this.falApi.uploadImage(spriteImage.file).subscribe({
        next: (imageUrl) => {
          this.state.setProgress(30);
          this.state.addLog('Image uploaded successfully');
          this.state.setStatus('in_queue');
          this.state.addLog('Sending generation request to Luma Dream Machine...');

          this.falApi.generateWithPolling({
            imageUrl: imageUrl,
            prompt: this.state.prompt(),
            aspectRatio: this.state.aspectRatio(),
            loop: true
          }).subscribe({
            next: (result) => {
              this.handleGenerationResult(result, imageUrl);
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
   * Generate with Kling VIDEO 2.6
   */
  private async generateWithKling(): Promise<void> {
    const spriteImage = this.state.spriteImage()!;
    const motionRef = this.state.motionReference();

    this.state.setStatus('uploading');
    this.state.setProgress(10);
    this.state.setLogs([]);

    try {
      this.state.addLog('Uploading sprite image...');

      // Upload sprite image
      this.klingApi.uploadFile(spriteImage.file).subscribe({
        next: (imageUrl) => {
          this.state.setProgress(20);
          this.state.addLog('Image uploaded successfully');

          // Upload motion reference if provided
          if (motionRef) {
            this.state.addLog('Uploading motion reference video...');
            this.klingApi.uploadFile(motionRef.file).subscribe({
              next: (motionRefUrl) => {
                this.state.setProgress(30);
                this.state.addLog('Motion reference uploaded');
                this.startKlingGeneration(imageUrl, motionRefUrl);
              },
              error: (error) => {
                this.state.setError(error.message || 'Motion reference upload error');
                this.state.addLog(`Error: ${error.message}`);
              }
            });
          } else {
            this.state.setProgress(30);
            this.startKlingGeneration(imageUrl, undefined);
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
   * Start Kling generation after uploads
   */
  private startKlingGeneration(imageUrl: string, motionRefUrl?: string): void {
    this.state.setStatus('in_queue');
    this.state.addLog('Sending generation request to Kling VIDEO 2.6...');

    if (motionRefUrl) {
      this.state.addLog('Motion control enabled - copying movements from reference');
    }

    // Map aspect ratio to Kling format
    const aspectRatio = this.state.aspectRatio();
    const klingAspectRatio = (aspectRatio === '16:9' || aspectRatio === '9:16')
      ? aspectRatio
      : '16:9'; // Default to 16:9 if not supported

    this.klingApi.generateWithPolling({
      imageUrl: imageUrl,
      prompt: this.state.prompt(),
      aspectRatio: klingAspectRatio as '16:9' | '9:16' | '1:1',
      duration: this.state.duration(),
      motionReferenceUrl: motionRefUrl
    }).subscribe({
      next: (result) => {
        this.handleGenerationResult(result, imageUrl);
      },
      error: (error) => {
        this.state.setError(error.message || 'Generation error');
        this.state.addLog(`Error: ${error.message}`);
      }
    });
  }

  /**
   * Handle generation result (common for both models)
   */
  private handleGenerationResult(result: any, imageUrl: string): void {
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

        // Save to history
        this.storageService.addToHistory({
          prompt: this.state.prompt(),
          aspectRatio: this.state.aspectRatio(),
          cost: this.costEstimate.pricePerVideo,
          videoUrl: result.video.url,
          spriteImageUrl: imageUrl,
          model: this.state.selectedModel(),
          duration: this.state.duration()
        });
      } else {
        this.state.addLog('Completed but no video in response');
        console.error('No video in result:', result);
      }
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
