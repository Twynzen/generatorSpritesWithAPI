import { Injectable, signal, computed } from '@angular/core';
import { ProcessedImage } from '../core/models/image-metadata.model';
import { AspectRatio } from '../core/models/cost.model';
import { VideoResult } from '../core/models/video-generation.model';
import { VideoModelType } from '../core/models/video-model.model';

export type GenerationStatus = 'idle' | 'uploading' | 'in_queue' | 'in_progress' | 'completed' | 'failed';

export interface MotionReference {
  file: File;
  url: string; // Preview URL
}

export interface GeneratorState {
  spriteImage: ProcessedImage | null;
  prompt: string;
  aspectRatio: AspectRatio;
  status: GenerationStatus;
  progress: number;
  logs: string[];
  result: VideoResult | null;
  error: string | null;
  // New fields for model selection
  selectedModel: VideoModelType;
  duration: number; // For Kling (5 or 10 seconds)
  motionReference: MotionReference | null; // For Kling motion control
}

@Injectable({
  providedIn: 'root'
})
export class VideoGeneratorState {
  // State signals
  private state = signal<GeneratorState>({
    spriteImage: null,
    prompt: '',
    aspectRatio: '16:9', // Default 16:9 (supported by both models)
    status: 'idle',
    progress: 0,
    logs: [],
    result: null,
    error: null,
    selectedModel: 'luma-dream-machine', // Default model
    duration: 5, // Default 5 seconds
    motionReference: null
  });

  // Selectors (computed)
  readonly spriteImage = computed(() => this.state().spriteImage);
  readonly prompt = computed(() => this.state().prompt);
  readonly aspectRatio = computed(() => this.state().aspectRatio);
  readonly status = computed(() => this.state().status);
  readonly progress = computed(() => this.state().progress);
  readonly logs = computed(() => this.state().logs);
  readonly result = computed(() => this.state().result);
  readonly error = computed(() => this.state().error);
  readonly selectedModel = computed(() => this.state().selectedModel);
  readonly duration = computed(() => this.state().duration);
  readonly motionReference = computed(() => this.state().motionReference);

  // Computed: determine if ready to generate
  readonly canGenerate = computed(() => {
    const s = this.state();
    return (
      s.spriteImage !== null &&
      s.prompt.trim().length > 0 &&
      s.status === 'idle'
    );
  });

  // Actions
  setSpriteImage(image: ProcessedImage | null): void {
    this.state.update(s => ({ ...s, spriteImage: image }));
  }

  setPrompt(prompt: string): void {
    this.state.update(s => ({ ...s, prompt }));
  }

  setAspectRatio(aspectRatio: AspectRatio): void {
    this.state.update(s => ({ ...s, aspectRatio }));
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

  setSelectedModel(model: VideoModelType): void {
    this.state.update(s => ({ ...s, selectedModel: model }));
  }

  setDuration(duration: number): void {
    this.state.update(s => ({ ...s, duration }));
  }

  setMotionReference(ref: MotionReference | null): void {
    this.state.update(s => ({ ...s, motionReference: ref }));
  }

  // Full reset
  reset(): void {
    this.state.set({
      spriteImage: null,
      prompt: '',
      aspectRatio: '16:9',
      status: 'idle',
      progress: 0,
      logs: [],
      result: null,
      error: null,
      selectedModel: 'luma-dream-machine',
      duration: 5,
      motionReference: null
    });
  }

  // Reset only generation (keep image, prompt, and model settings)
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
