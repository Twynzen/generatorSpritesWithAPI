export const environment = {
  production: false,
  falApi: {
    baseUrl: '/api/fal',
    apiKey: 'YOUR_FAL_API_KEY_HERE'
  },
  pricing: {
    pricePerVideo: 0.50,
    model: 'Luma Dream Machine',
    provider: 'fal.ai'
  } as const
};
