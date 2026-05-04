// Template committed to source control. Copy to environment.ts and fill in real values.
// The real environment.ts is gitignored — see scripts/generate-env.js.
export const environment = {
  production: false,
  alpaca: {
    apiKey: 'YOUR_ALPACA_API_KEY',
    secretKey: 'YOUR_ALPACA_SECRET_KEY',
    baseUrl: 'https://paper-api.alpaca.markets',
    dataUrl: 'https://data.alpaca.markets',
  },
};
