export const environment = {
  production: false,
  falApi: {
    // Use proxy in development to avoid CORS
    baseUrl: '/api/fal',
    // IMPORTANT: In production, use backend proxy
    // NEVER expose API key in production frontend
    apiKey: 'YOUR_FAL_API_KEY' // Get your key from https://fal.ai
  },
  pricing: {
    'luma-dream-machine': {
      pricePerVideo: 0.50,
      model: 'Luma Dream Machine',
      provider: 'fal.ai'
    },
    'kling-v2.6': {
      pricePerSecond: 0.032,
      model: 'Kling VIDEO 2.6',
      provider: 'fal.ai'
    }
  } as const
};
