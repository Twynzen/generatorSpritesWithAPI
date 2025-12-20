/**
 * Available video generation models
 */
export type VideoModelType = 'luma-dream-machine' | 'kling-v2.6';

export interface VideoModelInfo {
  id: VideoModelType;
  name: string;
  description: string;
  provider: string;
  features: string[];
  pricePerSecond?: number;  // For models that charge per second
  pricePerVideo?: number;   // For models with fixed pricing
  defaultDuration: number;  // Default duration in seconds
  maxDuration: number;      // Max duration in seconds
  supportedAspectRatios: string[];
  supportsMotionReference: boolean;
  supportsAudioGeneration: boolean;
}

export const VIDEO_MODELS: Record<VideoModelType, VideoModelInfo> = {
  'luma-dream-machine': {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    description: 'High-quality image-to-video with smooth loop animations',
    provider: 'fal.ai',
    features: ['Loop animation', 'Image to video', 'Fast generation'],
    pricePerVideo: 0.50,
    defaultDuration: 5,
    maxDuration: 5,
    supportedAspectRatios: ['16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
    supportsMotionReference: false,
    supportsAudioGeneration: false
  },
  'kling-v2.6': {
    id: 'kling-v2.6',
    name: 'Kling VIDEO 2.6',
    description: 'Motion control with reference video, native audio generation',
    provider: 'fal.ai',
    features: ['Motion control', 'Lip sync', 'Native audio', 'Up to 10s video'],
    pricePerSecond: 0.032,
    defaultDuration: 5,
    maxDuration: 10,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsMotionReference: true,
    supportsAudioGeneration: true
  }
};

/**
 * Get model info by ID
 */
export function getModelInfo(modelId: VideoModelType): VideoModelInfo {
  return VIDEO_MODELS[modelId];
}

/**
 * Calculate price for a model based on duration
 */
export function calculateModelPrice(modelId: VideoModelType, durationSeconds: number): number {
  const model = VIDEO_MODELS[modelId];
  if (model.pricePerVideo) {
    return model.pricePerVideo;
  }
  if (model.pricePerSecond) {
    return model.pricePerSecond * durationSeconds;
  }
  return 0;
}
