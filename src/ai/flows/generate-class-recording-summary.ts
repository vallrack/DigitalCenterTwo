'use server';

/**
 * @fileOverview Generates a summary of a class recording.
 *
 * - generateClassRecordingSummary - A function that generates a summary of a class recording.
 * - GenerateClassRecordingSummaryInput - The input type for the generateClassRecordingSummary function.
 * - GenerateClassRecordingSummaryOutput - The return type for the generateClassRecordingSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClassRecordingSummaryInputSchema = z.object({
  videoClassLink: z
    .string()
    .describe('The link to the video class recording.'),
});
export type GenerateClassRecordingSummaryInput = z.infer<
  typeof GenerateClassRecordingSummaryInputSchema
>;

const GenerateClassRecordingSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the class recording.'),
});
export type GenerateClassRecordingSummaryOutput = z.infer<
  typeof GenerateClassRecordingSummaryOutputSchema
>;

export async function generateClassRecordingSummary(
  input: GenerateClassRecordingSummaryInput
): Promise<GenerateClassRecordingSummaryOutput> {
  return generateClassRecordingSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassRecordingSummaryPrompt',
  input: {schema: GenerateClassRecordingSummaryInputSchema},
  output: {schema: GenerateClassRecordingSummaryOutputSchema},
  prompt: `You are an expert educational assistant. Generate a concise summary of the key topics covered in the following class recording. Focus on the core concepts and discussions, omitting irrelevant details. The class recording can be accessed at the following URL: {{{videoClassLink}}}. Please return the summary in markdown format.
`,
});

const generateClassRecordingSummaryFlow = ai.defineFlow(
  {
    name: 'generateClassRecordingSummaryFlow',
    inputSchema: GenerateClassRecordingSummaryInputSchema,
    outputSchema: GenerateClassRecordingSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
