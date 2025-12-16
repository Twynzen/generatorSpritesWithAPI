export const environment = {
  production: false,
  falApi: {
    // Use proxy in development to avoid CORS
    baseUrl: '/api/fal',
    // IMPORTANT: In production, use backend proxy
    // NEVER expose API key in production frontend
    apiKey: 'YOUR_FAL_API_KEY_HERE'
  },
  pricing: {
    // Luma Dream Machine has fixed price per video
    pricePerVideo: 0.50,
    model: 'Luma Dream Machine',
    provider: 'fal.ai'
  } as const
};
