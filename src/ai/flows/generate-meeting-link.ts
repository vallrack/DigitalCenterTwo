'use server';

/**
 * @fileOverview Generates a Google Meet link for a class.
 *
 * - generateMeetingLink - A function that generates a meeting link.
 * - GenerateMeetingLinkInput - The input type for the generateMeetingLink function.
 * - GenerateMeetingLinkOutput - The return type for the generateMeetingLink function.
 */

import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';
import { z } from 'genkit';

// Configure Genkit directly in the file
const ai = configureGenkit({
  plugins: [
    googleAI({ 
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

const GenerateMeetingLinkInputSchema = z.object({
  summary: z.string().describe('A brief summary or title for the meeting.'),
});
export type GenerateMeetingLinkInput = z.infer<
  typeof GenerateMeetingLinkInputSchema
>;

const GenerateMeetingLinkOutputSchema = z.object({
  meetingLink: z.string().url().describe('The generated Google Meet link.'),
});
export type GenerateMeetingLinkOutput = z.infer<
  typeof GenerateMeetingLinkOutputSchema
>;

// This is a mock tool. In a real scenario, you would integrate with Google Calendar API.
const createGoogleMeetLinkTool = ai.defineTool(
  {
    name: 'createGoogleMeetLink',
    description: 'Creates a Google Meet link for a scheduled class.',
    inputSchema: z.object({
      summary: z.string(),
    }),
    outputSchema: z.object({
      uri: z.string().url(),
    }),
  },
  async (input) => {
    // Mock implementation: Generate a plausible-looking but fake Meet URL
    const randomId = Math.random().toString(36).substring(2, 12);
    const meetCode = `${randomId.substring(0,3)}-${randomId.substring(3,7)}-${randomId.substring(7,10)}`;
    return {
      uri: `https://meet.google.com/${meetCode}`,
    };
  }
);


const prompt = ai.definePrompt({
  name: 'generateMeetingLinkPrompt',
  input: { schema: GenerateMeetingLinkInputSchema },
  output: { schema: GenerateMeetingLinkOutputSchema },
  tools: [createGoogleMeetLinkTool],
  prompt: `Generate a Google Meet link for a class with the following summary: {{{summary}}}. You must use the createGoogleMeetLink tool.`,
});

const generateMeetingLinkFlow = ai.defineFlow(
  {
    name: 'generateMeetingLinkFlow',
    inputSchema: GenerateMeetingLinkInputSchema,
    outputSchema: GenerateMeetingLinkOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const toolRequest = response.toolRequests[0];
    
    if (toolRequest?.name === 'createGoogleMeetLink') {
        const toolResponse = await createGoogleMeetLinkTool(toolRequest.input);
        return { meetingLink: toolResponse.uri };
    }
    
    throw new Error('Failed to get a tool response to generate meeting link.');
  }
);


export async function generateMeetingLink(
  input: GenerateMeetingLinkInput
): Promise<GenerateMeetingLinkOutput> {
  return generateMeetingLinkFlow(input);
}
