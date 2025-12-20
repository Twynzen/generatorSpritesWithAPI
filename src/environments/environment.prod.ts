export const environment = {
  production: true,
  falApi: {
    // In production, calls go to your backend which has the API key
    baseUrl: '/api/fal-proxy',
    apiKey: '' // Not used, backend handles authentication
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
