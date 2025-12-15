import { Injectable, signal, computed } from '@angular/core';
import { ProcessedImage } from '../core/models/image-metadata.model';
import { Resolution } from '../core/models/cost.model';
import { VideoResult } from '../core/models/video-generation.model';

export type GenerationStatus = 'idle' | 'uploading' | 'in_queue' | 'in_progress' | 'completed' | 'failed';

export interface GeneratorState {
  firstFrame: ProcessedImage | null;
  lastFrame: ProcessedImage | null;
  useSameFrame: boolean;
  prompt: string;
  resolution: Resolution;
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
    firstFrame: null,
    lastFrame: null,
    useSameFrame: true, // By default, use same image for loop
    prompt: '',
    resolution: '480p',
    status: 'idle',
    progress: 0,
    logs: [],
    result: null,
    error: null
  });

  // Selectors (computed)
  readonly firstFrame = computed(() => this.state().firstFrame);
  readonly lastFrame = computed(() => this.state().lastFrame);
  readonly useSameFrame = computed(() => this.state().useSameFrame);
  readonly prompt = computed(() => this.state().prompt);
  readonly resolution = computed(() => this.state().resolution);
  readonly status = computed(() => this.state().status);
  readonly progress = computed(() => this.state().progress);
  readonly logs = computed(() => this.state().logs);
  readonly result = computed(() => this.state().result);
  readonly error = computed(() => this.state().error);

  // Computed: determine if ready to generate
  readonly canGenerate = computed(() => {
    const s = this.state();
    return (
      s.firstFrame !== null &&
      s.prompt.trim().length > 0 &&
      s.status === 'idle'
    );
  });

  // Computed: effective frame for last_frame
  readonly effectiveLastFrame = computed(() => {
    const s = this.state();
    if (s.useSameFrame) {
      return s.firstFrame;
    }
    return s.lastFrame || s.firstFrame;
  });

  // Actions
  setFirstFrame(frame: ProcessedImage | null): void {
    this.state.update(s => ({ ...s, firstFrame: frame }));
  }

  setLastFrame(frame: ProcessedImage | null): void {
    this.state.update(s => ({ ...s, lastFrame: frame }));
  }

  setUseSameFrame(value: boolean): void {
    this.state.update(s => ({ ...s, useSameFrame: value }));
  }

  setPrompt(prompt: string): void {
    this.state.update(s => ({ ...s, prompt }));
  }

  setResolution(resolution: Resolution): void {
    this.state.update(s => ({ ...s, resolution }));
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
      firstFrame: null,
      lastFrame: null,
      useSameFrame: true,
      prompt: '',
      resolution: '480p',
      status: 'idle',
      progress: 0,
      logs: [],
      result: null,
      error: null
    });
  }

  // Reset only generation (keep images and prompt)
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
