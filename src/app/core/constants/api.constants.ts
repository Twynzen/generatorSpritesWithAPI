export const API_CONFIG = {
  FAL: {
    BASE_URL: 'https://queue.fal.run',
    UPLOAD_URL: 'https://fal.run/fal-ai/upload',
    MODEL: 'fal-ai/wan-flf2v',
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
