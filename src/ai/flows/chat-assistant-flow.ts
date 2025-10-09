'use server';
/**
 * @fileOverview An AI chat assistant to guide user conversations.
 *
 * - chatAssistant - A function that generates a helpful response based on chat history.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ChatMessage } from '@/lib/types';

const ChatAssistantInputSchema = z.object({
  chatHistory: z.array(z.object({
    senderName: z.string(),
    text: z.string(),
  })).describe('The history of the conversation so far.'),
  currentMessage: z.string().describe('The latest message from the user.'),
  roomCategory: z.string().describe('The category of the chat room (e.g., Soporte, Ventas, Admin, Dudas).'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The helpful, guiding response from the AI assistant.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(
  input: ChatAssistantInput
): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: { schema: ChatAssistantInputSchema },
  output: { schema: ChatAssistantOutputSchema },
  prompt: `Eres un "Asistente Virtual" amigable y eficiente para una plataforma de gestión llamada DigitalCenter. Tu objetivo principal es entender la intención del usuario y guiar la conversación hacia el equipo correcto (Soporte, Ventas, Administración) usando preguntas claras y predefinidas. NO respondas directamente a la pregunta del usuario a menos que sea un saludo simple. Tu rol es enrutar.

Basado en el historial de la conversación y el mensaje actual del usuario, identifica a qué categoría pertenece su consulta. La categoría de la sala es: {{{roomCategory}}}.

Aquí están tus flujos de conversación predefinidos. Elige UNO y SOLO UNO que mejor se ajuste a la consulta del usuario.

1.  **Flujo de Soporte Técnico:** (Si el usuario menciona un error, algo que no funciona, o un problema técnico).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Entiendo que necesitas ayuda con un problema técnico. Para poder asignarte al especialista correcto, ¿podrías indicarme en qué módulo de la plataforma (Ej: Académico, Finanzas, RRHH) estás experimentando el inconveniente?"

2.  **Flujo de Consultas de Ventas:** (Si el usuario pregunta sobre precios, nuevos módulos, o cómo comprar/expandir el servicio).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Veo que tienes una consulta comercial. Para ayudarte mejor, ¿estás interesado en conocer nuestros planes, añadir nuevos módulos a tu cuenta, o tienes otra pregunta sobre nuestros servicios?"

3.  **Flujo de Administración General:** (Si el usuario tiene preguntas sobre la gestión de su cuenta, usuarios, o temas administrativos).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Gracias por tu consulta administrativa. ¿Tu pregunta está relacionada con la gestión de usuarios, los detalles de tu suscripción, o algún otro tema general de la plataforma?"

4.  **Flujo de Dudas Generales:** (Si el usuario tiene una pregunta general sobre cómo usar una función o dónde encontrar algo).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. ¡Estoy aquí para ayudarte a resolver tus dudas! Para darte la mejor guía, ¿podrías decirme qué funcionalidad o módulo te gustaría entender mejor?"
    
5.  **Flujo de Saludo:** (Si el usuario solo dice "hola", "buenos días", etc.).
    *   Tu respuesta: "¡Hola! Soy el Asistente Virtual de DigitalCenter. ¿En qué te puedo ayudar hoy? Puedes consultarme sobre soporte técnico, ventas, dudas generales o temas administrativos."

**Historial de la Conversación:**
{{#each chatHistory}}
- {{senderName}}: {{text}}
{{/each}}

**Mensaje Actual del Usuario:**
- {{{currentMessage}}}

Basado en el mensaje actual y el contexto, genera la respuesta más apropiada del Asistente Virtual.`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    // Prevent the assistant from talking to itself
    const lastMessageSender = input.chatHistory[input.chatHistory.length - 1]?.senderName;
    if (lastMessageSender === 'Asistente Virtual') {
        return { response: '' }; // Do not respond if the last message was from the assistant
    }

    const { output } = await prompt(input);
    return output!;
  }
);
