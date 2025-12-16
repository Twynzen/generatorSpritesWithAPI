export const API_CONFIG = {
  FAL: {
    BASE_URL: 'https://queue.fal.run',
    UPLOAD_URL: 'https://fal.run/fal-ai/upload',
    POLLING_INTERVAL: 3000, // 3 seconds
    MAX_POLLING_ATTEMPTS: 100, // ~5 minutes max
    TIMEOUT: 300000 // 5 minutes
  },
  LIMITS: {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MAX_PROMPT_LENGTH: 500
  }
} as const;

export const RESOLUTIONS = {
  '480p': {
    width: 854,
    height: 480,
    label: '480p (SD)',
    description: 'Standard - Ideal for 2D game sprites'
  },
  '720p': {
    width: 1280,
    height: 720,
    label: '720p (HD)',
    description: 'High definition - Greater detail'
  }
} as const;

// ═══════════════════════════════════════════════════════════════
// VIDEO MODELS CONFIGURATION - Updated based on FAL.ai research
// ═══════════════════════════════════════════════════════════════

export type ModelTier = 'premium' | 'balanced' | 'economy';
export type ModelQuality = 1 | 2 | 3 | 4 | 5;

// Parameter name for end image varies by model
export type EndImageParamType = 'end_image_url' | 'tail_image_url' | 'images_array' | 'none';

export interface VideoModelConfig {
  id: string;
  endpoint: string;
  pollingEndpoint: string;
  name: string;
  provider: string;
  tier: ModelTier;
  quality: ModelQuality;
  estimatedTime: string;
  costPerVideo: number;
  costDisplay: string;
  maxDuration: number;
  aspectRatios: string[];
  promptRequired: boolean;
  supportsLoop: boolean;
  supportsNegativePrompt: boolean;
  supportsEndImage: boolean;
  endImageParamName: EndImageParamType; // Which param name to use for end frame
  description: string;
  icon: string;
}

export const VIDEO_MODELS: VideoModelConfig[] = [
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TIER - Highest quality, cinematic results
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'kling-v2.1-master',
    endpoint: 'fal-ai/kling-video/v2.1/master/image-to-video',
    pollingEndpoint: 'fal-ai/kling-video/v2.1/master',
    name: 'Kling v2.1 Master',
    provider: 'Kuaishou',
    tier: 'premium',
    quality: 5,
    estimatedTime: '3-5 min',
    costPerVideo: 1.40,
    costDisplay: '$1.40 (5s)',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: false, // Master does NOT support tail_image
    endImageParamName: 'none',
    description: 'Highest quality, NO end frame support',
    icon: '👑'
  },
  {
    id: 'luma-ray-2',
    endpoint: 'fal-ai/luma-dream-machine/ray-2/image-to-video',
    pollingEndpoint: 'fal-ai/luma-dream-machine/ray-2',
    name: 'Luma Ray 2',
    provider: 'Luma AI',
    tier: 'premium',
    quality: 4,
    estimatedTime: '2-3 min',
    costPerVideo: 0.50,
    costDisplay: '$0.50 (540p 5s)',
    maxDuration: 9,
    aspectRatios: ['16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
    promptRequired: true,
    supportsLoop: true,
    supportsNegativePrompt: false,
    supportsEndImage: true, // SUPPORTS end_image_url
    endImageParamName: 'end_image_url',
    description: 'High quality with end frame interpolation',
    icon: '⭐'
  },
  {
    id: 'kling-v2.1-pro',
    endpoint: 'fal-ai/kling-video/v2.1/pro/image-to-video',
    pollingEndpoint: 'fal-ai/kling-video/v2.1/pro',
    name: 'Kling v2.1 Pro',
    provider: 'Kuaishou',
    tier: 'premium',
    quality: 4,
    estimatedTime: '2-4 min',
    costPerVideo: 0.45,
    costDisplay: '$0.45 (5s)',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: false, // v2.1 does NOT support end frame - use Kling O1
    endImageParamName: 'none',
    description: 'Pro quality, single image animation',
    icon: '🎬'
  },
  {
    id: 'kling-o1',
    endpoint: 'fal-ai/kling-video/o1/image-to-video',
    pollingEndpoint: 'fal-ai/kling-video/o1',
    name: 'Kling O1 First-Last',
    provider: 'Kuaishou',
    tier: 'premium',
    quality: 4,
    estimatedTime: '2-4 min',
    costPerVideo: 0.56,
    costDisplay: '$0.56 (5s)',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: true, // O1 is designed for first/last frame!
    endImageParamName: 'tail_image_url',
    description: 'First-to-Last frame interpolation',
    icon: '🔄'
  },

  // ═══════════════════════════════════════════════════════════════
  // BALANCED TIER - Good quality at reasonable cost
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'luma-dream-machine',
    endpoint: 'fal-ai/luma-dream-machine/image-to-video',
    pollingEndpoint: 'fal-ai/luma-dream-machine',
    name: 'Luma Dream Machine v1.5',
    provider: 'Luma AI',
    tier: 'balanced',
    quality: 4,
    estimatedTime: '~2 min',
    costPerVideo: 0.50,
    costDisplay: '$0.50',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
    promptRequired: true,
    supportsLoop: true,
    supportsNegativePrompt: false,
    supportsEndImage: true, // SUPPORTS end_image_url
    endImageParamName: 'end_image_url',
    description: 'Proven model with end frame support',
    icon: '✨'
  },
  {
    id: 'minimax-video-01',
    endpoint: 'fal-ai/minimax/video-01/image-to-video',
    pollingEndpoint: 'fal-ai/minimax/video-01',
    name: 'MiniMax Video-01',
    provider: 'MiniMax/Hailuo',
    tier: 'balanced',
    quality: 4,
    estimatedTime: '~2 min',
    costPerVideo: 0.50,
    costDisplay: '$0.50',
    maxDuration: 6,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: false,
    supportsEndImage: false, // NO end frame support
    endImageParamName: 'none',
    description: 'Camera control via [brackets] in prompt',
    icon: '🎥'
  },
  {
    id: 'kling-v2.1-standard',
    endpoint: 'fal-ai/kling-video/v2.1/standard/image-to-video',
    pollingEndpoint: 'fal-ai/kling-video/v2.1/standard',
    name: 'Kling v2.1 Standard',
    provider: 'Kuaishou',
    tier: 'balanced',
    quality: 3,
    estimatedTime: '1-2 min',
    costPerVideo: 0.25,
    costDisplay: '$0.25 (5s)',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: false, // Standard does NOT support tail_image
    endImageParamName: 'none',
    description: 'Budget Kling, NO end frame support',
    icon: '⚡'
  },
  // ── Wan Models (First/Last Frame specialists) ──
  {
    id: 'wan-flf2v',
    endpoint: 'fal-ai/wan-flf2v',
    pollingEndpoint: 'fal-ai/wan-flf2v',
    name: 'Wan 2.1 First-Last Frame',
    provider: 'Wan',
    tier: 'balanced',
    quality: 4,
    estimatedTime: '~1-2 min',
    costPerVideo: 0.40,
    costDisplay: '$0.40 (720p)',
    maxDuration: 5,
    aspectRatios: ['auto', '16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: true, // DESIGNED for first/last frame!
    endImageParamName: 'end_image_url',
    description: 'BEST for walk cycles - start_image + end_image',
    icon: '🎯'
  },
  {
    id: 'wan-i2v',
    endpoint: 'fal-ai/wan-i2v',
    pollingEndpoint: 'fal-ai/wan-i2v',
    name: 'Wan 2.1 Image-to-Video',
    provider: 'Wan',
    tier: 'balanced',
    quality: 3,
    estimatedTime: '~1 min',
    costPerVideo: 0.20,
    costDisplay: '$0.20 (480p)',
    maxDuration: 5,
    aspectRatios: ['auto', '16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: false, // Single image only
    endImageParamName: 'none',
    description: 'Single image animation, no end frame',
    icon: '💎'
  },
  {
    id: 'luma-ray-2-flash',
    endpoint: 'fal-ai/luma-dream-machine/ray-2-flash/image-to-video',
    pollingEndpoint: 'fal-ai/luma-dream-machine/ray-2-flash',
    name: 'Luma Ray 2 Flash',
    provider: 'Luma AI',
    tier: 'balanced',
    quality: 3,
    estimatedTime: '~1 min',
    costPerVideo: 0.20,
    costDisplay: '$0.20 (540p 5s)',
    maxDuration: 9,
    aspectRatios: ['16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
    promptRequired: true,
    supportsLoop: true,
    supportsNegativePrompt: false,
    supportsEndImage: true, // SUPPORTS end_image_url like Ray 2
    endImageParamName: 'end_image_url',
    description: '3x faster, 3x cheaper than Ray 2, with end frame',
    icon: '⚡'
  },
  {
    id: 'pika-v2.2',
    endpoint: 'fal-ai/pika/v2.2/image-to-video',
    pollingEndpoint: 'fal-ai/pika/v2.2',
    name: 'Pika v2.2',
    provider: 'Pika Labs',
    tier: 'balanced',
    quality: 3,
    estimatedTime: '1-2 min',
    costPerVideo: 0.20,
    costDisplay: '$0.20 (720p)',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: false,
    supportsEndImage: false, // Use Pikaframes for end frame
    endImageParamName: 'none',
    description: 'Basic I2V, use Pikaframes for keyframes',
    icon: '🎨'
  },

  // ═══════════════════════════════════════════════════════════════
  // ECONOMY TIER - Fast and cheap for prototyping
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'stable-video',
    endpoint: 'fal-ai/stable-video',
    pollingEndpoint: 'fal-ai/stable-video',
    name: 'Stable Video Diffusion',
    provider: 'Stability AI',
    tier: 'economy',
    quality: 2,
    estimatedTime: '~30s',
    costPerVideo: 0.075,
    costDisplay: '$0.075',
    maxDuration: 4,
    aspectRatios: ['input-based'],
    promptRequired: false, // NO PROMPT - image only
    supportsLoop: false,
    supportsNegativePrompt: false,
    supportsEndImage: false,
    endImageParamName: 'none',
    description: 'No prompt needed, motion_bucket_id controls motion',
    icon: '🚀'
  },
  {
    id: 'fast-svd-lcm',
    endpoint: 'fal-ai/fast-svd-lcm',
    pollingEndpoint: 'fal-ai/fast-svd-lcm',
    name: 'Fast SVD (LCM Turbo)',
    provider: 'Stability AI',
    tier: 'economy',
    quality: 2,
    estimatedTime: '~10s',
    costPerVideo: 0.01,
    costDisplay: '~$0.01',
    maxDuration: 4,
    aspectRatios: ['input-based'],
    promptRequired: false,
    supportsLoop: false,
    supportsNegativePrompt: false,
    supportsEndImage: false,
    endImageParamName: 'none',
    description: '5x faster than SVD, best for prototyping',
    icon: '💨'
  },
  {
    id: 'ltx-video',
    endpoint: 'fal-ai/ltx-video/image-to-video',
    pollingEndpoint: 'fal-ai/ltx-video',
    name: 'LTX Video',
    provider: 'Lightricks',
    tier: 'economy',
    quality: 2,
    estimatedTime: '~20s',
    costPerVideo: 0.02,
    costDisplay: '$0.02',
    maxDuration: 5,
    aspectRatios: ['input-based'],
    promptRequired: true,
    supportsLoop: false,
    supportsNegativePrompt: true,
    supportsEndImage: false,
    endImageParamName: 'none',
    description: 'Research license only - NOT commercial',
    icon: '💰'
  }
];

// Default model (the one currently working)
export const DEFAULT_MODEL = VIDEO_MODELS.find(m => m.id === 'luma-dream-machine')!;

// Utility functions
export const getModelsByTier = (tier: ModelTier): VideoModelConfig[] =>
  VIDEO_MODELS.filter(m => m.tier === tier);

export const getModelById = (id: string): VideoModelConfig | undefined =>
  VIDEO_MODELS.find(m => m.id === id);

export const getModelsSortedByQuality = (): VideoModelConfig[] =>
  [...VIDEO_MODELS].sort((a, b) => b.quality - a.quality);

export const getModelsSortedByCost = (): VideoModelConfig[] =>
  [...VIDEO_MODELS].sort((a, b) => a.costPerVideo - b.costPerVideo);

// Get models that support first/last frame interpolation
export const getModelsWithEndFrameSupport = (): VideoModelConfig[] =>
  VIDEO_MODELS.filter(m => m.supportsEndImage);
