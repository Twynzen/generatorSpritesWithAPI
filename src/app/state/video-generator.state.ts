import { Injectable, signal, computed } from '@angular/core';
import { ProcessedImage } from '../core/models/image-metadata.model';
import { AspectRatio } from '../core/models/cost.model';
import { VideoResult } from '../core/models/video-generation.model';
import { VideoModelConfig, DEFAULT_MODEL } from '../core/constants/api.constants';

export type GenerationStatus = 'idle' | 'uploading' | 'in_queue' | 'in_progress' | 'completed' | 'failed';

export interface GeneratorState {
  spriteImage: ProcessedImage | null;  // Start/first frame image
  endImage: ProcessedImage | null;     // End/last frame image (for models that support it)
  prompt: string;
  aspectRatio: AspectRatio | string;
  selectedModel: VideoModelConfig;
  status: GenerationStatus;
  progress: number;
  logs: string[];
  result: VideoResult | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VideoGeneratorState {
  // State signals
  private state = signal<GeneratorState>({
    spriteImage: null,
    endImage: null,
    prompt: '',
    aspectRatio: '4:3', // Default 4:3 for sprites
    selectedModel: DEFAULT_MODEL,
    status: 'idle',
    progress: 0,
    logs: [],
    result: null,
    error: null
  });

  // Selectors (computed)
  readonly spriteImage = computed(() => this.state().spriteImage);
  readonly endImage = computed(() => this.state().endImage);
  readonly prompt = computed(() => this.state().prompt);
  readonly aspectRatio = computed(() => this.state().aspectRatio);
  readonly selectedModel = computed(() => this.state().selectedModel);
  readonly status = computed(() => this.state().status);
  readonly progress = computed(() => this.state().progress);
  readonly logs = computed(() => this.state().logs);
  readonly result = computed(() => this.state().result);
  readonly error = computed(() => this.state().error);

  // Computed: does current model need end image?
  readonly needsEndImage = computed(() => this.state().selectedModel.supportsEndImage);

  // Computed: determine if ready to generate
  readonly canGenerate = computed(() => {
    const s = this.state();
    // If model doesn't require prompt, only need image
    const promptValid = !s.selectedModel.promptRequired || s.prompt.trim().length > 0;
    // If model supports end image, require both images
    const imagesValid = s.selectedModel.supportsEndImage
      ? (s.spriteImage !== null && s.endImage !== null)
      : (s.spriteImage !== null);
    return (
      imagesValid &&
      promptValid &&
      s.status === 'idle'
    );
  });

  // Actions
  setSpriteImage(image: ProcessedImage | null): void {
    this.state.update(s => ({ ...s, spriteImage: image }));
  }

  setEndImage(image: ProcessedImage | null): void {
    this.state.update(s => ({ ...s, endImage: image }));
  }

  setPrompt(prompt: string): void {
    this.state.update(s => ({ ...s, prompt }));
  }

  setAspectRatio(aspectRatio: AspectRatio | string): void {
    this.state.update(s => ({ ...s, aspectRatio }));
  }

  setSelectedModel(model: VideoModelConfig): void {
    this.state.update(s => {
      // Check if current aspect ratio is supported by the new model
      const currentAspectRatio = s.aspectRatio;
      const isSupported = model.aspectRatios.includes(currentAspectRatio) ||
                          model.aspectRatios.includes('input-based');

      // If not supported, use the first available aspect ratio for this model
      const newAspectRatio = isSupported ? currentAspectRatio : model.aspectRatios[0];

      return { ...s, selectedModel: model, aspectRatio: newAspectRatio };
    });
  }

  setStatus(status: GenerationStatus): void {
    this.state.update(s => ({ ...s, status }));
  }

  setProgress(progress: number): void {
    this.state.update(s => ({ ...s, progress }));
  }

  addLog(log: string): void {
    this.state.update(s => ({ ...s, logs: [...s.logs, log] }));
  }

  setLogs(logs: string[]): void {
    this.state.update(s => ({ ...s, logs }));
  }

  setResult(result: VideoResult | null): void {
    this.state.update(s => ({ ...s, result, status: result ? 'completed' : s.status }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error, status: error ? 'failed' : s.status }));
  }

  // Full reset
  reset(): void {
    this.state.set({
      spriteImage: null,
      endImage: null,
      prompt: '',
      aspectRatio: '4:3',
      selectedModel: DEFAULT_MODEL,
      status: 'idle',
      progress: 0,
      logs: [],
      result: null,
      error: null
    });
  }

  // Reset only generation (keep image and prompt)
  resetGeneration(): void {
    this.state.update(s => ({
      ...s,
      status: 'idle',
      progress: 0,
      logs: [],
      result: null,
      error: null
    }));
  }
}
