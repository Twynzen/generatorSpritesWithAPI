export const environment = {
  production: true,
  falApi: {
    // In production, calls go to your backend which has the API key
    baseUrl: '/api/fal-proxy',
    apiKey: '' // Not used, backend handles authentication
  },
  pricing: {
    '480p': 0.20,
    '720p': 0.40
  } as const
};
