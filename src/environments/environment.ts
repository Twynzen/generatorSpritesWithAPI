export const environment = {
  production: false,
  falApi: {
    baseUrl: 'https://queue.fal.run',
    // IMPORTANT: In production, use backend proxy
    // NEVER expose API key in production frontend
    apiKey: 'YOUR_FAL_API_KEY_HERE'
  },
  pricing: {
    '480p': 0.20,
    '720p': 0.40
  } as const
};
