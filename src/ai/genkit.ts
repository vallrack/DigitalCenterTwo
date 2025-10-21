
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';

export const ai = configureGenkit({
  plugins: [
    googleAI({ 
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
